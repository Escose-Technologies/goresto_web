import { createSign, createHash } from 'crypto';
import { readFileSync } from 'fs';
import { env } from '../config/env.js';

let _config;
function getConfig() {
  if (_config) return _config;
  const ns = env.OCI_NAMESPACE;
  const keyPath = env.OCI_PRIVATE_KEY_PATH;
  if (!ns || !keyPath) throw new Error('OCI storage not configured (OCI_NAMESPACE / OCI_PRIVATE_KEY_PATH missing)');
  _config = {
    namespace: ns,
    bucket: env.OCI_BUCKET,
    region: env.OCI_REGION,
    host: `objectstorage.${env.OCI_REGION}.oraclecloud.com`,
    keyId: `${env.OCI_TENANCY_OCID}/${env.OCI_USER_OCID}/${env.OCI_FINGERPRINT}`,
    privateKey: readFileSync(keyPath, 'utf8'),
  };
  return _config;
}

function sign(signingString, privateKey) {
  const signer = createSign('RSA-SHA256');
  signer.update(signingString);
  return signer.sign(privateKey, 'base64');
}

function buildSignature(method, path, headers, headersToSign, cfg) {
  const signingString = headersToSign
    .map((h) => (h === '(request-target)' ? `(request-target): ${method.toLowerCase()} ${path}` : `${h}: ${headers[h]}`))
    .join('\n');
  const signature = sign(signingString, cfg.privateKey);
  return `Signature version="1",keyId="${cfg.keyId}",algorithm="rsa-sha256",headers="${headersToSign.join(' ')}",signature="${signature}"`;
}

export async function uploadImage(buffer, fileName, contentType) {
  const cfg = getConfig();
  const path = `/n/${cfg.namespace}/b/${cfg.bucket}/o/${encodeURIComponent(fileName)}`;
  const now = new Date().toUTCString();
  const bodyHash = createHash('sha256').update(buffer).digest('base64');

  const headers = {
    'date': now,
    'host': cfg.host,
    'content-type': contentType,
    'content-length': String(buffer.length),
    'x-content-sha256': bodyHash,
  };

  const headersToSign = ['(request-target)', 'date', 'host', 'content-type', 'content-length', 'x-content-sha256'];
  headers['authorization'] = buildSignature('PUT', path, headers, headersToSign, cfg);

  const res = await fetch(`https://${cfg.host}${path}`, {
    method: 'PUT',
    headers,
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OCI upload failed (${res.status}): ${text}`);
  }

  return `https://${cfg.host}/n/${cfg.namespace}/b/${cfg.bucket}/o/${encodeURIComponent(fileName)}`;
}

export async function deleteImage(fileName) {
  const cfg = getConfig();
  const path = `/n/${cfg.namespace}/b/${cfg.bucket}/o/${encodeURIComponent(fileName)}`;
  const now = new Date().toUTCString();

  const headers = { 'date': now, 'host': cfg.host };
  const headersToSign = ['(request-target)', 'date', 'host'];
  headers['authorization'] = buildSignature('DELETE', path, headers, headersToSign, cfg);

  const res = await fetch(`https://${cfg.host}${path}`, { method: 'DELETE', headers });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`OCI delete failed (${res.status}): ${text}`);
  }
}
