import{r as _}from"./index.CVf8TyFT.js";var i={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var l=_,a=Symbol.for("react.element"),y=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,c=l.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,v={key:!0,ref:!0,__self:!0,__source:!0};function p(e,t,s){var r,o={},f=null,u=null;s!==void 0&&(f=""+s),t.key!==void 0&&(f=""+t.key),t.ref!==void 0&&(u=t.ref);for(r in t)m.call(t,r)&&!v.hasOwnProperty(r)&&(o[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)o[r]===void 0&&(o[r]=t[r]);return{$$typeof:a,type:e,key:f,ref:u,props:o,_owner:c.current}}n.Fragment=y;n.jsx=p;n.jsxs=p;i.exports=n;var E=i.exports;function d(e,t,s){if(e==null)return[];if(e instanceof EventTarget)return[e];if(typeof e=="string"){const o=document.querySelectorAll(e);return o?Array.from(o):[]}return Array.from(e).filter(r=>r!=null)}export{E as j,d as r};
