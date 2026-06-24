import { createSign, createHash } from 'crypto';
import { readFileSync } from 'fs';
import { env } from '../config/env.js';

const OCI_NAMESPACE = env.OCI_NAMESPACE;
const OCI_BUCKET = env.OCI_BUCKET;
const OCI_REGION = env.OCI_REGION;
const OCI_TENANCY = env.OCI_TENANCY_OCID;
const OCI_USER = env.OCI_USER_OCID;
const OCI_FINGERPRINT = env.OCI_FINGERPRINT;
const OCI_KEY_PATH = env.OCI_PRIVATE_KEY_PATH;

const HOST = `objectstorage.${OCI_REGION}.oraclecloud.com`;
const BASE_URL = `https://${HOST}`;
const KEY_ID = `${OCI_TENANCY}/${OCI_USER}/${OCI_FINGERPRINT}`;

let privateKey;
function getPrivateKey() {
  if (!privateKey) privateKey = readFileSync(OCI_KEY_PATH, 'utf8');
  return privateKey;
}

function sign(signingString) {
  const signer = createSign('RSA-SHA256');
  signer.update(signingString);
  return signer.sign(getPrivateKey(), 'base64');
}

function buildSignature(method, path, headers, headersToSign) {
  const signingString = headersToSign
    .map((h) => (h === '(request-target)' ? `(request-target): ${method.toLowerCase()} ${path}` : `${h}: ${headers[h]}`))
    .join('\n');
  const signature = sign(signingString);
  return `Signature version="1",keyId="${KEY_ID}",algorithm="rsa-sha256",headers="${headersToSign.join(' ')}",signature="${signature}"`;
}

export async function uploadImage(buffer, fileName, contentType) {
  const path = `/n/${OCI_NAMESPACE}/b/${OCI_BUCKET}/o/${encodeURIComponent(fileName)}`;
  const now = new Date().toUTCString();
  const bodyHash = createHash('sha256').update(buffer).digest('base64');

  const headers = {
    'date': now,
    'host': HOST,
    'content-type': contentType,
    'content-length': String(buffer.length),
    'x-content-sha256': bodyHash,
  };

  const headersToSign = ['(request-target)', 'date', 'host', 'content-type', 'content-length', 'x-content-sha256'];
  headers['authorization'] = buildSignature('PUT', path, headers, headersToSign);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OCI upload failed (${res.status}): ${text}`);
  }

  return `${BASE_URL}${'/n/' + OCI_NAMESPACE + '/b/' + OCI_BUCKET + '/o/' + encodeURIComponent(fileName)}`;
}

export async function deleteImage(fileName) {
  const path = `/n/${OCI_NAMESPACE}/b/${OCI_BUCKET}/o/${encodeURIComponent(fileName)}`;
  const now = new Date().toUTCString();

  const headers = { 'date': now, 'host': HOST };
  const headersToSign = ['(request-target)', 'date', 'host'];
  headers['authorization'] = buildSignature('DELETE', path, headers, headersToSign);

  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`OCI delete failed (${res.status}): ${text}`);
  }
}
