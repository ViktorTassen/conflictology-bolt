var background=function(){"use strict";var Rl,Nl;function Rh(n){return n==null||typeof n=="function"?{main:n}:n}const Nh=()=>{};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dr={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const A=function(n,e){if(!n)throw dt(e)},dt=function(n){return new Error("Firebase Database ("+dr.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fr=function(n){const e=[];let t=0;for(let i=0;i<n.length;i++){let r=n.charCodeAt(i);r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):(r&64512)===55296&&i+1<n.length&&(n.charCodeAt(i+1)&64512)===56320?(r=65536+((r&1023)<<10)+(n.charCodeAt(++i)&1023),e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},kh=function(n){const e=[];let t=0,i=0;for(;t<n.length;){const r=n[t++];if(r<128)e[i++]=String.fromCharCode(r);else if(r>191&&r<224){const o=n[t++];e[i++]=String.fromCharCode((r&31)<<6|o&63)}else if(r>239&&r<365){const o=n[t++],l=n[t++],c=n[t++],d=((r&7)<<18|(o&63)<<12|(l&63)<<6|c&63)-65536;e[i++]=String.fromCharCode(55296+(d>>10)),e[i++]=String.fromCharCode(56320+(d&1023))}else{const o=n[t++],l=n[t++];e[i++]=String.fromCharCode((r&15)<<12|(o&63)<<6|l&63)}}return e.join("")},Ii={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let r=0;r<n.length;r+=3){const o=n[r],l=r+1<n.length,c=l?n[r+1]:0,d=r+2<n.length,f=d?n[r+2]:0,T=o>>2,I=(o&3)<<4|c>>4;let S=(c&15)<<2|f>>6,N=f&63;d||(N=64,l||(S=64)),i.push(t[T],t[I],t[S],t[N])}return i.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(fr(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):kh(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let r=0;r<n.length;){const o=t[n.charAt(r++)],c=r<n.length?t[n.charAt(r)]:0;++r;const f=r<n.length?t[n.charAt(r)]:64;++r;const I=r<n.length?t[n.charAt(r)]:64;if(++r,o==null||c==null||f==null||I==null)throw new Ph;const S=o<<2|c>>4;if(i.push(S),f!==64){const N=c<<4&240|f>>2;if(i.push(N),I!==64){const R=f<<6&192|I;i.push(R)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Ph extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const pr=function(n){const e=fr(n);return Ii.encodeByteArray(e,!0)},Cn=function(n){return pr(n).replace(/\./g,"")},Sn=function(n){try{return Ii.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oh(n){return gr(void 0,n)}function gr(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!Dh(t)||(n[t]=gr(n[t],e[t]));return n}function Dh(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lh(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mh=()=>Lh().__FIREBASE_DEFAULTS__,xh=()=>{if(typeof process>"u"||typeof process.env>"u")return;const n=process.env.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Fh=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Sn(n[1]);return e&&JSON.parse(e)},_r=()=>{try{return Nh()||Mh()||xh()||Fh()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},mr=n=>{var e,t;return(t=(e=_r())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},yr=n=>{const e=mr(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const i=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),i]:[e.substring(0,t),i]},vr=()=>{var n;return(n=_r())===null||n===void 0?void 0:n.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,i)=>{t?this.reject(t):this.resolve(i),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,i))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Er(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},i=e||"demo-project",r=n.iat||0,o=n.sub||n.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const l=Object.assign({iss:`https://securetoken.google.com/${i}`,aud:i,iat:r,exp:r+3600,auth_time:r,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}}},n);return[Cn(JSON.stringify(t)),Cn(JSON.stringify(l)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ae(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Ci(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ae())}function Uh(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Bh(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function wr(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Hh(){return dr.NODE_ADMIN===!0}function jh(){try{return typeof indexedDB=="object"}catch{return!1}}function Wh(){return new Promise((n,e)=>{try{let t=!0;const i="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(i);r.onsuccess=()=>{r.result.close(),t||self.indexedDB.deleteDatabase(i),n(!0)},r.onupgradeneeded=()=>{t=!1},r.onerror=()=>{var o;e(((o=r.error)===null||o===void 0?void 0:o.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vh="FirebaseError";class Be extends Error{constructor(e,t,i){super(t),this.code=e,this.customData=i,this.name=Vh,Object.setPrototypeOf(this,Be.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ot.prototype.create)}}class Ot{constructor(e,t,i){this.service=e,this.serviceName=t,this.errors=i}create(e,...t){const i=t[0]||{},r=`${this.service}/${e}`,o=this.errors[e],l=o?zh(o,i):"Error",c=`${this.serviceName}: ${l} (${r}).`;return new Be(r,c,i)}}function zh(n,e){return n.replace($h,(t,i)=>{const r=e[i];return r!=null?String(r):`<${i}?>`})}const $h=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dt(n){return JSON.parse(n)}function Z(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ir=function(n){let e={},t={},i={},r="";try{const o=n.split(".");e=Dt(Sn(o[0])||""),t=Dt(Sn(o[1])||""),r=o[2],i=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:i,signature:r}},Gh=function(n){const e=Ir(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},Kh=function(n){const e=Ir(n).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ke(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function ft(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function Tr(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function bn(n,e,t){const i={};for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&(i[r]=e.call(t,n[r],r,n));return i}function He(n,e){if(n===e)return!0;const t=Object.keys(n),i=Object.keys(e);for(const r of t){if(!i.includes(r))return!1;const o=n[r],l=e[r];if(Cr(o)&&Cr(l)){if(!He(o,l))return!1}else if(o!==l)return!1}for(const r of i)if(!t.includes(r))return!1;return!0}function Cr(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Si(n){const e=[];for(const[t,i]of Object.entries(n))Array.isArray(i)?i.forEach(r=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(i));return e.length?"&"+e.join("&"):""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qh{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=64,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const i=this.W_;if(typeof e=="string")for(let I=0;I<16;I++)i[I]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let I=0;I<16;I++)i[I]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let I=16;I<80;I++){const S=i[I-3]^i[I-8]^i[I-14]^i[I-16];i[I]=(S<<1|S>>>31)&4294967295}let r=this.chain_[0],o=this.chain_[1],l=this.chain_[2],c=this.chain_[3],d=this.chain_[4],f,T;for(let I=0;I<80;I++){I<40?I<20?(f=c^o&(l^c),T=1518500249):(f=o^l^c,T=1859775393):I<60?(f=o&l|c&(o|l),T=2400959708):(f=o^l^c,T=3395469782);const S=(r<<5|r>>>27)+f+d+T+i[I]&4294967295;d=c,c=l,l=(o<<30|o>>>2)&4294967295,o=r,r=S}this.chain_[0]=this.chain_[0]+r&4294967295,this.chain_[1]=this.chain_[1]+o&4294967295,this.chain_[2]=this.chain_[2]+l&4294967295,this.chain_[3]=this.chain_[3]+c&4294967295,this.chain_[4]=this.chain_[4]+d&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const i=t-this.blockSize;let r=0;const o=this.buf_;let l=this.inbuf_;for(;r<t;){if(l===0)for(;r<=i;)this.compress_(e,r),r+=this.blockSize;if(typeof e=="string"){for(;r<t;)if(o[l]=e.charCodeAt(r),++l,++r,l===this.blockSize){this.compress_(o),l=0;break}}else for(;r<t;)if(o[l]=e[r],++l,++r,l===this.blockSize){this.compress_(o),l=0;break}}this.inbuf_=l,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let r=this.blockSize-1;r>=56;r--)this.buf_[r]=t&255,t/=256;this.compress_(this.buf_);let i=0;for(let r=0;r<5;r++)for(let o=24;o>=0;o-=8)e[i]=this.chain_[r]>>o&255,++i;return e}}function Yh(n,e){const t=new Xh(n,e);return t.subscribe.bind(t)}class Xh{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(i=>{this.error(i)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,i){let r;if(e===void 0&&t===void 0&&i===void 0)throw new Error("Missing Observer.");Jh(e,["next","error","complete"])?r=e:r={next:e,error:t,complete:i},r.next===void 0&&(r.next=bi),r.error===void 0&&(r.error=bi),r.complete===void 0&&(r.complete=bi);const o=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),o}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(i){typeof console<"u"&&console.error&&console.error(i)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Jh(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function bi(){}function Qh(n,e){return`${n} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zh=function(n){const e=[];let t=0;for(let i=0;i<n.length;i++){let r=n.charCodeAt(i);if(r>=55296&&r<=56319){const o=r-55296;i++,A(i<n.length,"Surrogate pair missing trail surrogate.");const l=n.charCodeAt(i)-56320;r=65536+(o<<10)+l}r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):r<65536?(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},An=function(n){let e=0;for(let t=0;t<n.length;t++){const i=n.charCodeAt(t);i<128?e++:i<2048?e+=2:i>=55296&&i<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Je(n){return n&&n._delegate?n._delegate:n}class je{constructor(e,t,i){this.name=e,this.instanceFactory=t,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qe="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ec{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const i=new Ti;if(this.instancesDeferred.set(t,i),this.isInitialized(t)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:t});r&&i.resolve(r)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const i=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(i)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:i})}catch(o){if(r)return null;throw o}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(nc(e))try{this.getOrInitializeService({instanceIdentifier:Qe})}catch{}for(const[t,i]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const o=this.getOrInitializeService({instanceIdentifier:r});i.resolve(o)}catch{}}}}clearInstance(e=Qe){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Qe){return this.instances.has(e)}getOptions(e=Qe){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,i=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(i))throw Error(`${this.name}(${i}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:i,options:t});for(const[o,l]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(o);i===c&&l.resolve(r)}return r}onInit(e,t){var i;const r=this.normalizeInstanceIdentifier(t),o=(i=this.onInitCallbacks.get(r))!==null&&i!==void 0?i:new Set;o.add(e),this.onInitCallbacks.set(r,o);const l=this.instances.get(r);return l&&e(l,r),()=>{o.delete(e)}}invokeOnInitCallbacks(e,t){const i=this.onInitCallbacks.get(t);if(i)for(const r of i)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let i=this.instances.get(e);if(!i&&this.component&&(i=this.component.instanceFactory(this.container,{instanceIdentifier:tc(e),options:t}),this.instances.set(e,i),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(i,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,i)}catch{}return i||null}normalizeInstanceIdentifier(e=Qe){return this.component?this.component.multipleInstances?e:Qe:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function tc(n){return n===Qe?void 0:n}function nc(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ic{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new ec(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var U;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(U||(U={}));const sc={debug:U.DEBUG,verbose:U.VERBOSE,info:U.INFO,warn:U.WARN,error:U.ERROR,silent:U.SILENT},rc=U.INFO,oc={[U.DEBUG]:"log",[U.VERBOSE]:"log",[U.INFO]:"info",[U.WARN]:"warn",[U.ERROR]:"error"},ac=(n,e,...t)=>{if(e<n.logLevel)return;const i=new Date().toISOString(),r=oc[e];if(r)console[r](`[${i}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Rn{constructor(e){this.name=e,this._logLevel=rc,this._logHandler=ac,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in U))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?sc[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,U.DEBUG,...e),this._logHandler(this,U.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,U.VERBOSE,...e),this._logHandler(this,U.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,U.INFO,...e),this._logHandler(this,U.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,U.WARN,...e),this._logHandler(this,U.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,U.ERROR,...e),this._logHandler(this,U.ERROR,...e)}}const lc=(n,e)=>e.some(t=>n instanceof t);let Sr,br;function hc(){return Sr||(Sr=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function cc(){return br||(br=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Ar=new WeakMap,Ai=new WeakMap,Rr=new WeakMap,Ri=new WeakMap,Ni=new WeakMap;function uc(n){const e=new Promise((t,i)=>{const r=()=>{n.removeEventListener("success",o),n.removeEventListener("error",l)},o=()=>{t(We(n.result)),r()},l=()=>{i(n.error),r()};n.addEventListener("success",o),n.addEventListener("error",l)});return e.then(t=>{t instanceof IDBCursor&&Ar.set(t,n)}).catch(()=>{}),Ni.set(e,n),e}function dc(n){if(Ai.has(n))return;const e=new Promise((t,i)=>{const r=()=>{n.removeEventListener("complete",o),n.removeEventListener("error",l),n.removeEventListener("abort",l)},o=()=>{t(),r()},l=()=>{i(n.error||new DOMException("AbortError","AbortError")),r()};n.addEventListener("complete",o),n.addEventListener("error",l),n.addEventListener("abort",l)});Ai.set(n,e)}let ki={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Ai.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Rr.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return We(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function fc(n){ki=n(ki)}function pc(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const i=n.call(Pi(this),e,...t);return Rr.set(i,e.sort?e.sort():[e]),We(i)}:cc().includes(n)?function(...e){return n.apply(Pi(this),e),We(Ar.get(this))}:function(...e){return We(n.apply(Pi(this),e))}}function gc(n){return typeof n=="function"?pc(n):(n instanceof IDBTransaction&&dc(n),lc(n,hc())?new Proxy(n,ki):n)}function We(n){if(n instanceof IDBRequest)return uc(n);if(Ri.has(n))return Ri.get(n);const e=gc(n);return e!==n&&(Ri.set(n,e),Ni.set(e,n)),e}const Pi=n=>Ni.get(n);function _c(n,e,{blocked:t,upgrade:i,blocking:r,terminated:o}={}){const l=indexedDB.open(n,e),c=We(l);return i&&l.addEventListener("upgradeneeded",d=>{i(We(l.result),d.oldVersion,d.newVersion,We(l.transaction),d)}),t&&l.addEventListener("blocked",d=>t(d.oldVersion,d.newVersion,d)),c.then(d=>{o&&d.addEventListener("close",()=>o()),r&&d.addEventListener("versionchange",f=>r(f.oldVersion,f.newVersion,f))}).catch(()=>{}),c}const mc=["get","getKey","getAll","getAllKeys","count"],yc=["put","add","delete","clear"],Oi=new Map;function Nr(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Oi.get(e))return Oi.get(e);const t=e.replace(/FromIndex$/,""),i=e!==t,r=yc.includes(t);if(!(t in(i?IDBIndex:IDBObjectStore).prototype)||!(r||mc.includes(t)))return;const o=async function(l,...c){const d=this.transaction(l,r?"readwrite":"readonly");let f=d.store;return i&&(f=f.index(c.shift())),(await Promise.all([f[t](...c),r&&d.done]))[0]};return Oi.set(e,o),o}fc(n=>({...n,get:(e,t,i)=>Nr(e,t)||n.get(e,t,i),has:(e,t)=>!!Nr(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vc{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Ec(t)){const i=t.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(t=>t).join(" ")}}function Ec(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Di="@firebase/app",kr="0.11.4";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pe=new Rn("@firebase/app"),wc="@firebase/app-compat",Ic="@firebase/analytics-compat",Tc="@firebase/analytics",Cc="@firebase/app-check-compat",Sc="@firebase/app-check",bc="@firebase/auth",Ac="@firebase/auth-compat",Rc="@firebase/database",Nc="@firebase/data-connect",kc="@firebase/database-compat",Pc="@firebase/functions",Oc="@firebase/functions-compat",Dc="@firebase/installations",Lc="@firebase/installations-compat",Mc="@firebase/messaging",xc="@firebase/messaging-compat",Fc="@firebase/performance",Uc="@firebase/performance-compat",Bc="@firebase/remote-config",Hc="@firebase/remote-config-compat",jc="@firebase/storage",Wc="@firebase/storage-compat",Vc="@firebase/firestore",zc="@firebase/vertexai",$c="@firebase/firestore-compat",Gc="firebase",Kc="11.6.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Li="[DEFAULT]",qc={[Di]:"fire-core",[wc]:"fire-core-compat",[Tc]:"fire-analytics",[Ic]:"fire-analytics-compat",[Sc]:"fire-app-check",[Cc]:"fire-app-check-compat",[bc]:"fire-auth",[Ac]:"fire-auth-compat",[Rc]:"fire-rtdb",[Nc]:"fire-data-connect",[kc]:"fire-rtdb-compat",[Pc]:"fire-fn",[Oc]:"fire-fn-compat",[Dc]:"fire-iid",[Lc]:"fire-iid-compat",[Mc]:"fire-fcm",[xc]:"fire-fcm-compat",[Fc]:"fire-perf",[Uc]:"fire-perf-compat",[Bc]:"fire-rc",[Hc]:"fire-rc-compat",[jc]:"fire-gcs",[Wc]:"fire-gcs-compat",[Vc]:"fire-fst",[$c]:"fire-fst-compat",[zc]:"fire-vertex","fire-js":"fire-js",[Gc]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lt=new Map,Yc=new Map,Mi=new Map;function Pr(n,e){try{n.container.addComponent(e)}catch(t){Pe.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Ze(n){const e=n.name;if(Mi.has(e))return Pe.debug(`There were multiple attempts to register component ${e}.`),!1;Mi.set(e,n);for(const t of Lt.values())Pr(t,n);for(const t of Yc.values())Pr(t,n);return!0}function Nn(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Oe(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xc={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ve=new Ot("app","Firebase",Xc);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jc{constructor(e,t,i){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=i,this.container.addComponent(new je("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ve.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mt=Kc;function Or(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const i=Object.assign({name:Li,automaticDataCollectionEnabled:!1},e),r=i.name;if(typeof r!="string"||!r)throw Ve.create("bad-app-name",{appName:String(r)});if(t||(t=vr()),!t)throw Ve.create("no-options");const o=Lt.get(r);if(o){if(He(t,o.options)&&He(i,o.config))return o;throw Ve.create("duplicate-app",{appName:r})}const l=new ic(r);for(const d of Mi.values())l.addComponent(d);const c=new Jc(t,i,l);return Lt.set(r,c),c}function xi(n=Li){const e=Lt.get(n);if(!e&&n===Li&&vr())return Or();if(!e)throw Ve.create("no-app",{appName:n});return e}function Dr(){return Array.from(Lt.values())}function Re(n,e,t){var i;let r=(i=qc[n])!==null&&i!==void 0?i:n;t&&(r+=`-${t}`);const o=r.match(/\s|\//),l=e.match(/\s|\//);if(o||l){const c=[`Unable to register library "${r}" with version "${e}":`];o&&c.push(`library name "${r}" contains illegal characters (whitespace or "/")`),o&&l&&c.push("and"),l&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Pe.warn(c.join(" "));return}Ze(new je(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qc="firebase-heartbeat-database",Zc=1,xt="firebase-heartbeat-store";let Fi=null;function Lr(){return Fi||(Fi=_c(Qc,Zc,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(xt)}catch(t){console.warn(t)}}}}).catch(n=>{throw Ve.create("idb-open",{originalErrorMessage:n.message})})),Fi}async function eu(n){try{const t=(await Lr()).transaction(xt),i=await t.objectStore(xt).get(xr(n));return await t.done,i}catch(e){if(e instanceof Be)Pe.warn(e.message);else{const t=Ve.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Pe.warn(t.message)}}}async function Mr(n,e){try{const i=(await Lr()).transaction(xt,"readwrite");await i.objectStore(xt).put(e,xr(n)),await i.done}catch(t){if(t instanceof Be)Pe.warn(t.message);else{const i=Ve.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Pe.warn(i.message)}}}function xr(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tu=1024,nu=30;class iu{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new ru(t),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){var e,t;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=Fr();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(l=>l.date===o))return;if(this._heartbeatsCache.heartbeats.push({date:o,agent:r}),this._heartbeatsCache.heartbeats.length>nu){const l=ou(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(l,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(i){Pe.warn(i)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Fr(),{heartbeatsToSend:i,unsentEntries:r}=su(this._heartbeatsCache.heartbeats),o=Cn(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(t){return Pe.warn(t),""}}}function Fr(){return new Date().toISOString().substring(0,10)}function su(n,e=tu){const t=[];let i=n.slice();for(const r of n){const o=t.find(l=>l.agent===r.agent);if(o){if(o.dates.push(r.date),Ur(t)>e){o.dates.pop();break}}else if(t.push({agent:r.agent,dates:[r.date]}),Ur(t)>e){t.pop();break}i=i.slice(1)}return{heartbeatsToSend:t,unsentEntries:i}}class ru{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return jh()?Wh().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await eu(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const r=await this.read();return Mr(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const r=await this.read();return Mr(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Ur(n){return Cn(JSON.stringify({version:2,heartbeats:n})).length}function ou(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let i=1;i<n.length;i++)n[i].date<t&&(t=n[i].date,e=i);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function au(n){Ze(new je("platform-logger",e=>new vc(e),"PRIVATE")),Ze(new je("heartbeat",e=>new iu(e),"PRIVATE")),Re(Di,kr,n),Re(Di,kr,"esm2017"),Re("fire-js","")}au("");var lu="firebase",hu="11.6.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Re(lu,hu,"app");function Br(n,e){var t={};for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&e.indexOf(i)<0&&(t[i]=n[i]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var r=0,i=Object.getOwnPropertySymbols(n);r<i.length;r++)e.indexOf(i[r])<0&&Object.prototype.propertyIsEnumerable.call(n,i[r])&&(t[i[r]]=n[i[r]]);return t}typeof SuppressedError=="function"&&SuppressedError;function Hr(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const cu=Hr,jr=new Ot("auth","Firebase",Hr());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kn=new Rn("@firebase/auth");function uu(n,...e){kn.logLevel<=U.WARN&&kn.warn(`Auth (${Mt}): ${n}`,...e)}function Pn(n,...e){kn.logLevel<=U.ERROR&&kn.error(`Auth (${Mt}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function On(n,...e){throw Ui(n,...e)}function Wr(n,...e){return Ui(n,...e)}function Vr(n,e,t){const i=Object.assign(Object.assign({},cu()),{[e]:t});return new Ot("auth","Firebase",i).create(e,{appName:n.name})}function Ft(n){return Vr(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Ui(n,...e){if(typeof n!="string"){const t=e[0],i=[...e.slice(1)];return i[0]&&(i[0].appName=n.name),n._errorFactory.create(t,...i)}return jr.create(n,...e)}function D(n,e,...t){if(!n)throw Ui(e,...t)}function Ut(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Pn(e),new Error(e)}function Dn(n,e){n||Ut(e)}function du(){return zr()==="http:"||zr()==="https:"}function zr(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fu(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(du()||Bh()||"connection"in navigator)?navigator.onLine:!0}function pu(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gu{constructor(e,t){this.shortDelay=e,this.longDelay=t,Dn(t>e,"Short delay should be less than long delay!"),this.isMobile=Ci()||wr()}get(){return fu()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _u(n,e){Dn(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $r{static initialize(e,t,i){this.fetchImpl=e,t&&(this.headersImpl=t),i&&(this.responseImpl=i)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Ut("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Ut("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Ut("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mu={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yu=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],vu=new gu(3e4,6e4);function Bi(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function Bt(n,e,t,i,r={}){return Gr(n,r,async()=>{let o={},l={};i&&(e==="GET"?l=i:o={body:JSON.stringify(i)});const c=Si(Object.assign({key:n.config.apiKey},l)).slice(1),d=await n._getAdditionalHeaders();d["Content-Type"]="application/json",n.languageCode&&(d["X-Firebase-Locale"]=n.languageCode);const f=Object.assign({method:e,headers:d},o);return Uh()||(f.referrerPolicy="no-referrer"),$r.fetch()(await Kr(n,n.config.apiHost,t,c),f)})}async function Gr(n,e,t){n._canInitEmulator=!1;const i=Object.assign(Object.assign({},mu),e);try{const r=new wu(n),o=await Promise.race([t(),r.promise]);r.clearNetworkTimeout();const l=await o.json();if("needConfirmation"in l)throw Ln(n,"account-exists-with-different-credential",l);if(o.ok&&!("errorMessage"in l))return l;{const c=o.ok?l.errorMessage:l.error.message,[d,f]=c.split(" : ");if(d==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ln(n,"credential-already-in-use",l);if(d==="EMAIL_EXISTS")throw Ln(n,"email-already-in-use",l);if(d==="USER_DISABLED")throw Ln(n,"user-disabled",l);const T=i[d]||d.toLowerCase().replace(/[_\s]+/g,"-");if(f)throw Vr(n,T,f);On(n,T)}}catch(r){if(r instanceof Be)throw r;On(n,"network-request-failed",{message:String(r)})}}async function Eu(n,e,t,i,r={}){const o=await Bt(n,e,t,i,r);return"mfaPendingCredential"in o&&On(n,"multi-factor-auth-required",{_serverResponse:o}),o}async function Kr(n,e,t,i){const r=`${e}${t}?${i}`,o=n,l=o.config.emulator?_u(n.config,r):`${n.config.apiScheme}://${r}`;return yu.includes(t)&&(await o._persistenceManagerAvailable,o._getPersistenceType()==="COOKIE")?o._getPersistence()._getFinalTarget(l).toString():l}class wu{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,i)=>{this.timer=setTimeout(()=>i(Wr(this.auth,"network-request-failed")),vu.get())})}}function Ln(n,e,t){const i={appName:n.name};t.email&&(i.email=t.email),t.phoneNumber&&(i.phoneNumber=t.phoneNumber);const r=Wr(n,e,i);return r.customData._tokenResponse=t,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Iu(n,e){return Bt(n,"POST","/v1/accounts:delete",e)}async function Mn(n,e){return Bt(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ht(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Tu(n,e=!1){const t=Je(n),i=await t.getIdToken(e),r=qr(i);D(r&&r.exp&&r.auth_time&&r.iat,t.auth,"internal-error");const o=typeof r.firebase=="object"?r.firebase:void 0,l=o==null?void 0:o.sign_in_provider;return{claims:r,token:i,authTime:Ht(Hi(r.auth_time)),issuedAtTime:Ht(Hi(r.iat)),expirationTime:Ht(Hi(r.exp)),signInProvider:l||null,signInSecondFactor:(o==null?void 0:o.sign_in_second_factor)||null}}function Hi(n){return Number(n)*1e3}function qr(n){const[e,t,i]=n.split(".");if(e===void 0||t===void 0||i===void 0)return Pn("JWT malformed, contained fewer than 3 sections"),null;try{const r=Sn(t);return r?JSON.parse(r):(Pn("Failed to decode base64 JWT payload"),null)}catch(r){return Pn("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function Yr(n){const e=qr(n);return D(e,"internal-error"),D(typeof e.exp<"u","internal-error"),D(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ji(n,e,t=!1){if(t)return e;try{return await e}catch(i){throw i instanceof Be&&Cu(i)&&n.auth.currentUser===n&&await n.auth.signOut(),i}}function Cu({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Su{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const i=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),i}else{this.errorBackoff=3e4;const r=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ht(this.lastLoginAt),this.creationTime=Ht(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xn(n){var e;const t=n.auth,i=await n.getIdToken(),r=await ji(n,Mn(t,{idToken:i}));D(r==null?void 0:r.users.length,t,"internal-error");const o=r.users[0];n._notifyReloadListener(o);const l=!((e=o.providerUserInfo)===null||e===void 0)&&e.length?Xr(o.providerUserInfo):[],c=Au(n.providerData,l),d=n.isAnonymous,f=!(n.email&&o.passwordHash)&&!(c!=null&&c.length),T=d?f:!1,I={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:c,metadata:new Wi(o.createdAt,o.lastLoginAt),isAnonymous:T};Object.assign(n,I)}async function bu(n){const e=Je(n);await xn(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Au(n,e){return[...n.filter(i=>!e.some(r=>r.providerId===i.providerId)),...e]}function Xr(n){return n.map(e=>{var{providerId:t}=e,i=Br(e,["providerId"]);return{providerId:t,uid:i.rawId||"",displayName:i.displayName||null,email:i.email||null,phoneNumber:i.phoneNumber||null,photoURL:i.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ru(n,e){const t=await Gr(n,{},async()=>{const i=Si({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:o}=n.config,l=await Kr(n,r,"/v1/token",`key=${o}`),c=await n._getAdditionalHeaders();return c["Content-Type"]="application/x-www-form-urlencoded",$r.fetch()(l,{method:"POST",headers:c,body:i})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Nu(n,e){return Bt(n,"POST","/v2/accounts:revokeToken",Bi(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pt{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){D(e.idToken,"internal-error"),D(typeof e.idToken<"u","internal-error"),D(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Yr(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){D(e.length!==0,"internal-error");const t=Yr(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(D(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:i,refreshToken:r,expiresIn:o}=await Ru(e,t);this.updateTokensAndExpiration(i,r,Number(o))}updateTokensAndExpiration(e,t,i){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+i*1e3}static fromJSON(e,t){const{refreshToken:i,accessToken:r,expirationTime:o}=t,l=new pt;return i&&(D(typeof i=="string","internal-error",{appName:e}),l.refreshToken=i),r&&(D(typeof r=="string","internal-error",{appName:e}),l.accessToken=r),o&&(D(typeof o=="number","internal-error",{appName:e}),l.expirationTime=o),l}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new pt,this.toJSON())}_performRefresh(){return Ut("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ze(n,e){D(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class we{constructor(e){var{uid:t,auth:i,stsTokenManager:r}=e,o=Br(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new Su(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=i,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=o.displayName||null,this.email=o.email||null,this.emailVerified=o.emailVerified||!1,this.phoneNumber=o.phoneNumber||null,this.photoURL=o.photoURL||null,this.isAnonymous=o.isAnonymous||!1,this.tenantId=o.tenantId||null,this.providerData=o.providerData?[...o.providerData]:[],this.metadata=new Wi(o.createdAt||void 0,o.lastLoginAt||void 0)}async getIdToken(e){const t=await ji(this,this.stsTokenManager.getToken(this.auth,e));return D(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Tu(this,e)}reload(){return bu(this)}_assign(e){this!==e&&(D(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new we(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){D(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let i=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),i=!0),t&&await xn(this),await this.auth._persistUserIfCurrent(this),i&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Oe(this.auth.app))return Promise.reject(Ft(this.auth));const e=await this.getIdToken();return await ji(this,Iu(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var i,r,o,l,c,d,f,T;const I=(i=t.displayName)!==null&&i!==void 0?i:void 0,S=(r=t.email)!==null&&r!==void 0?r:void 0,N=(o=t.phoneNumber)!==null&&o!==void 0?o:void 0,R=(l=t.photoURL)!==null&&l!==void 0?l:void 0,P=(c=t.tenantId)!==null&&c!==void 0?c:void 0,k=(d=t._redirectEventId)!==null&&d!==void 0?d:void 0,_e=(f=t.createdAt)!==null&&f!==void 0?f:void 0,Q=(T=t.lastLoginAt)!==null&&T!==void 0?T:void 0,{uid:q,emailVerified:me,isAnonymous:lt,providerData:pe,stsTokenManager:v}=t;D(q&&v,e,"internal-error");const p=pt.fromJSON(this.name,v);D(typeof q=="string",e,"internal-error"),ze(I,e.name),ze(S,e.name),D(typeof me=="boolean",e,"internal-error"),D(typeof lt=="boolean",e,"internal-error"),ze(N,e.name),ze(R,e.name),ze(P,e.name),ze(k,e.name),ze(_e,e.name),ze(Q,e.name);const _=new we({uid:q,auth:e,email:S,emailVerified:me,displayName:I,isAnonymous:lt,photoURL:R,phoneNumber:N,tenantId:P,stsTokenManager:p,createdAt:_e,lastLoginAt:Q});return pe&&Array.isArray(pe)&&(_.providerData=pe.map(m=>Object.assign({},m))),k&&(_._redirectEventId=k),_}static async _fromIdTokenResponse(e,t,i=!1){const r=new pt;r.updateFromServerResponse(t);const o=new we({uid:t.localId,auth:e,stsTokenManager:r,isAnonymous:i});return await xn(o),o}static async _fromGetAccountInfoResponse(e,t,i){const r=t.users[0];D(r.localId!==void 0,"internal-error");const o=r.providerUserInfo!==void 0?Xr(r.providerUserInfo):[],l=!(r.email&&r.passwordHash)&&!(o!=null&&o.length),c=new pt;c.updateFromIdToken(i);const d=new we({uid:r.localId,auth:e,stsTokenManager:c,isAnonymous:l}),f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:o,metadata:new Wi(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!(o!=null&&o.length)};return Object.assign(d,f),d}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jr=new Map;function et(n){Dn(n instanceof Function,"Expected a class definition");let e=Jr.get(n);return e?(Dn(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Jr.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qr{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Qr.type="NONE";const Zr=Qr;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vi(n,e,t){return`firebase:${n}:${e}:${t}`}class gt{constructor(e,t,i){this.persistence=e,this.auth=t,this.userKey=i;const{config:r,name:o}=this.auth;this.fullUserKey=Vi(this.userKey,r.apiKey,o),this.fullPersistenceKey=Vi("persistence",r.apiKey,o),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Mn(this.auth,{idToken:e}).catch(()=>{});return t?we._fromGetAccountInfoResponse(this.auth,t,e):null}return we._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,i="authUser"){if(!t.length)return new gt(et(Zr),e,i);const r=(await Promise.all(t.map(async f=>{if(await f._isAvailable())return f}))).filter(f=>f);let o=r[0]||et(Zr);const l=Vi(i,e.config.apiKey,e.name);let c=null;for(const f of t)try{const T=await f._get(l);if(T){let I;if(typeof T=="string"){const S=await Mn(e,{idToken:T}).catch(()=>{});if(!S)break;I=await we._fromGetAccountInfoResponse(e,S,T)}else I=we._fromJSON(e,T);f!==o&&(c=I),o=f;break}}catch{}const d=r.filter(f=>f._shouldAllowMigration);return!o._shouldAllowMigration||!d.length?new gt(o,e,i):(o=d[0],c&&await o._set(l,c.toJSON()),await Promise.all(t.map(async f=>{if(f!==o)try{await f._remove(l)}catch{}})),new gt(o,e,i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eo(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Du(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(ku(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Mu(e))return"Blackberry";if(xu(e))return"Webos";if(Pu(e))return"Safari";if((e.includes("chrome/")||Ou(e))&&!e.includes("edge/"))return"Chrome";if(Lu(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,i=n.match(t);if((i==null?void 0:i.length)===2)return i[1]}return"Other"}function ku(n=Ae()){return/firefox\//i.test(n)}function Pu(n=Ae()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Ou(n=Ae()){return/crios\//i.test(n)}function Du(n=Ae()){return/iemobile/i.test(n)}function Lu(n=Ae()){return/android/i.test(n)}function Mu(n=Ae()){return/blackberry/i.test(n)}function xu(n=Ae()){return/webos/i.test(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function to(n,e=[]){let t;switch(n){case"Browser":t=eo(Ae());break;case"Worker":t=`${eo(Ae())}-${n}`;break;default:t=n}const i=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Mt}/${i}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fu{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const i=o=>new Promise((l,c)=>{try{const d=e(o);l(d)}catch(d){c(d)}});i.onAbort=t,this.queue.push(i);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const i of this.queue)await i(e),i.onAbort&&t.push(i.onAbort)}catch(i){t.reverse();for(const r of t)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:i==null?void 0:i.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Uu(n,e={}){return Bt(n,"GET","/v2/passwordPolicy",Bi(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bu=6;class Hu{constructor(e){var t,i,r,o;const l=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=l.minPasswordLength)!==null&&t!==void 0?t:Bu,l.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=l.maxPasswordLength),l.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=l.containsLowercaseCharacter),l.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=l.containsUppercaseCharacter),l.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=l.containsNumericCharacter),l.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=l.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(r=(i=e.allowedNonAlphanumericCharacters)===null||i===void 0?void 0:i.join(""))!==null&&r!==void 0?r:"",this.forceUpgradeOnSignin=(o=e.forceUpgradeOnSignin)!==null&&o!==void 0?o:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,i,r,o,l,c;const d={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,d),this.validatePasswordCharacterOptions(e,d),d.isValid&&(d.isValid=(t=d.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),d.isValid&&(d.isValid=(i=d.meetsMaxPasswordLength)!==null&&i!==void 0?i:!0),d.isValid&&(d.isValid=(r=d.containsLowercaseLetter)!==null&&r!==void 0?r:!0),d.isValid&&(d.isValid=(o=d.containsUppercaseLetter)!==null&&o!==void 0?o:!0),d.isValid&&(d.isValid=(l=d.containsNumericCharacter)!==null&&l!==void 0?l:!0),d.isValid&&(d.isValid=(c=d.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),d}validatePasswordLengthOptions(e,t){const i=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;i&&(t.meetsMinPasswordLength=e.length>=i),r&&(t.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let i;for(let r=0;r<e.length;r++)i=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(t,i>="a"&&i<="z",i>="A"&&i<="Z",i>="0"&&i<="9",this.allowedNonAlphanumericCharacters.includes(i))}updatePasswordCharacterOptionsStatuses(e,t,i,r,o){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=i)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ju{constructor(e,t,i,r){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=i,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new no(this),this.idTokenSubscription=new no(this),this.beforeStateQueue=new Fu(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=jr,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(o=>this._resolvePersistenceManagerAvailable=o)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=et(t)),this._initializationPromise=this.queue(async()=>{var i,r,o;if(!this._deleted&&(this.persistenceManager=await gt.create(this,e),(i=this._resolvePersistenceManagerAvailable)===null||i===void 0||i.call(this),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((o=this.currentUser)===null||o===void 0?void 0:o.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Mn(this,{idToken:e}),i=await we._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(i)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Oe(this.app)){const l=this.app.settings.authIdToken;return l?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(l).then(c,c))}):this.directlySetCurrentUser(null)}const i=await this.assertedPersistence.getCurrentUser();let r=i,o=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const l=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=r==null?void 0:r._redirectEventId,d=await this.tryRedirectSignIn(e);(!l||l===c)&&(d!=null&&d.user)&&(r=d.user,o=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(o)try{await this.beforeStateQueue.runMiddleware(r)}catch(l){r=i,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(l))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return D(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await xn(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=pu()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Oe(this.app))return Promise.reject(Ft(this));const t=e?Je(e):null;return t&&D(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&D(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Oe(this.app)?Promise.reject(Ft(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Oe(this.app)?Promise.reject(Ft(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(et(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Uu(this),t=new Hu(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Ot("auth","Firebase",e())}onAuthStateChanged(e,t,i){return this.registerStateListener(this.authStateSubscription,e,t,i)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,i){return this.registerStateListener(this.idTokenSubscription,e,t,i)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const i=this.onAuthStateChanged(()=>{i(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(i.tenantId=this.tenantId),await Nu(this,i)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const i=await this.getOrInitRedirectPersistenceManager(t);return e===null?i.removeCurrentUser():i.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&et(e)||this._popupRedirectResolver;D(t,this,"argument-error"),this.redirectPersistenceManager=await gt.create(this,[et(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,i;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((i=this.redirectUser)===null||i===void 0?void 0:i._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const i=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==i&&(this.lastNotifiedUid=i,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,i,r){if(this._deleted)return()=>{};const o=typeof t=="function"?t:t.next.bind(t);let l=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(D(c,this,"internal-error"),c.then(()=>{l||o(this.currentUser)}),typeof t=="function"){const d=e.addObserver(t,i,r);return()=>{l=!0,d()}}else{const d=e.addObserver(t);return()=>{l=!0,d()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return D(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=to(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const i=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());i&&(t["X-Firebase-Client"]=i);const r=await this._getAppCheckToken();return r&&(t["X-Firebase-AppCheck"]=r),t}async _getAppCheckToken(){var e;if(Oe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&uu(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function zi(n){return Je(n)}class no{constructor(e){this.auth=e,this.observer=null,this.addObserver=Yh(t=>this.observer=t)}get next(){return D(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wu(n,e){const t=Nn(n,"auth");if(t.isInitialized()){const r=t.getImmediate(),o=t.getOptions();if(He(o,e??{}))return r;On(r,"already-initialized")}return t.initialize({options:e})}function Vu(n,e){const t=(e==null?void 0:e.persistence)||[],i=(Array.isArray(t)?t:[t]).map(et);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(i,e==null?void 0:e.popupRedirectResolver)}function zu(n,e,t){const i=zi(n);D(/^https?:\/\//.test(e),i,"invalid-emulator-scheme");const r=!1,o=io(e),{host:l,port:c}=$u(e),d=c===null?"":`:${c}`,f={url:`${o}//${l}${d}/`},T=Object.freeze({host:l,port:c,protocol:o.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!i._canInitEmulator){D(i.config.emulator&&i.emulatorConfig,i,"emulator-config-failed"),D(He(f,i.config.emulator)&&He(T,i.emulatorConfig),i,"emulator-config-failed");return}i.config.emulator=f,i.emulatorConfig=T,i.settings.appVerificationDisabledForTesting=!0,Gu()}function io(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function $u(n){const e=io(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const i=t[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(i);if(r){const o=r[1];return{host:o,port:so(i.substr(o.length+1))}}else{const[o,l]=i.split(":");return{host:o,port:so(l)}}}function so(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function Gu(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,i,r=!1){const o=await we._fromIdTokenResponse(e,i,r),l=ro(i);return new Fn({user:o,providerId:l,_tokenResponse:i,operationType:t})}static async _forOperation(e,t,i){await e._updateTokensIfNecessary(i,!0);const r=ro(i);return new Fn({user:e,providerId:r,_tokenResponse:i,operationType:t})}}function ro(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ku(n,e){return Eu(n,"POST","/v1/accounts:signInWithCustomToken",Bi(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qu(n,e){if(Oe(n.app))return Promise.reject(Ft(n));const t=zi(n),i=await Ku(t,{token:e,returnSecureToken:!0}),r=await Fn._fromIdTokenResponse(t,"signIn",i);return await t._updateCurrentUser(r.user),r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yu(n,e){return Je(n).setPersistence(e)}const oo="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xu(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Un{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(r=>r.isListeningto(e));if(t)return t;const i=new Un(e);return this.receivers.push(i),i}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:i,eventType:r,data:o}=t.data,l=this.handlersMap[r];if(!(l!=null&&l.size))return;t.ports[0].postMessage({status:"ack",eventId:i,eventType:r});const c=Array.from(l).map(async f=>f(t.origin,o)),d=await Xu(c);t.ports[0].postMessage({status:"done",eventId:i,eventType:r,response:d})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Un.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ju(n="",e=10){let t="";for(let i=0;i<e;i++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qu{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,i=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let o,l;return new Promise((c,d)=>{const f=Ju("",20);r.port1.start();const T=setTimeout(()=>{d(new Error("unsupported_event"))},i);l={messageChannel:r,onMessage(I){const S=I;if(S.data.eventId===f)switch(S.data.status){case"ack":clearTimeout(T),o=setTimeout(()=>{d(new Error("timeout"))},3e3);break;case"done":clearTimeout(o),c(S.data.response);break;default:clearTimeout(T),clearTimeout(o),d(new Error("invalid_response"));break}}},this.handlers.add(l),r.port1.addEventListener("message",l.onMessage),this.target.postMessage({eventType:e,eventId:f,data:t},[r.port2])}).finally(()=>{l&&this.removeMessageHandler(l)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ao(){return window}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lo(){return typeof ao().WorkerGlobalScope<"u"&&typeof ao().importScripts=="function"}async function Zu(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function ed(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function td(){return lo()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ho="firebaseLocalStorageDb",nd=1,Bn="firebaseLocalStorage",co="fbase_key";class jt{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Hn(n,e){return n.transaction([Bn],e?"readwrite":"readonly").objectStore(Bn)}function id(){const n=indexedDB.deleteDatabase(ho);return new jt(n).toPromise()}function $i(){const n=indexedDB.open(ho,nd);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const i=n.result;try{i.createObjectStore(Bn,{keyPath:co})}catch(r){t(r)}}),n.addEventListener("success",async()=>{const i=n.result;i.objectStoreNames.contains(Bn)?e(i):(i.close(),await id(),e(await $i()))})})}async function uo(n,e,t){const i=Hn(n,!0).put({[co]:e,value:t});return new jt(i).toPromise()}async function sd(n,e){const t=Hn(n,!1).get(e),i=await new jt(t).toPromise();return i===void 0?null:i.value}function fo(n,e){const t=Hn(n,!0).delete(e);return new jt(t).toPromise()}const rd=800,od=3;class po{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await $i(),this.db)}async _withRetries(e){let t=0;for(;;)try{const i=await this._openDb();return await e(i)}catch(i){if(t++>od)throw i;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return lo()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Un._getInstance(td()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await Zu(),!this.activeServiceWorker)return;this.sender=new Qu(this.activeServiceWorker);const i=await this.sender._send("ping",{},800);i&&!((e=i[0])===null||e===void 0)&&e.fulfilled&&!((t=i[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||ed()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await $i();return await uo(e,oo,"1"),await fo(e,oo),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(i=>uo(i,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(i=>sd(i,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>fo(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const o=Hn(r,!1).getAll();return new jt(o).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],i=new Set;if(e.length!==0)for(const{fbase_key:r,value:o}of e)i.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(o)&&(this.notifyListeners(r,o),t.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!i.has(r)&&(this.notifyListeners(r,null),t.push(r));return t}notifyListeners(e,t){this.localCache[e]=t;const i=this.listeners[e];if(i)for(const r of Array.from(i))r(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),rd)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}po.type="LOCAL";const go=po;var _o="@firebase/auth",mo="1.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ad{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(i=>{e((i==null?void 0:i.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){D(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ld(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function hd(n){Ze(new je("auth",(e,{options:t})=>{const i=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),o=e.getProvider("app-check-internal"),{apiKey:l,authDomain:c}=i.options;D(l&&!l.includes(":"),"invalid-api-key",{appName:i.name});const d={apiKey:l,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:to(n)},f=new ju(i,r,o,d);return Vu(f,t),f},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,i)=>{e.getProvider("auth-internal").initialize()})),Ze(new je("auth-internal",e=>{const t=zi(e.getProvider("auth").getImmediate());return(i=>new ad(i))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Re(_o,mo,ld(n)),Re(_o,mo,"esm2017")}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cd(n=xi()){const e=Nn(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Wu(n,{persistence:[go]}),i=mr("auth");return i&&zu(t,`http://${i}`),t}hd("WebExtension");var yo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var vo;(function(){var n;/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */function e(v,p){function _(){}_.prototype=p.prototype,v.D=p.prototype,v.prototype=new _,v.prototype.constructor=v,v.C=function(m,y,w){for(var g=Array(arguments.length-2),xe=2;xe<arguments.length;xe++)g[xe-2]=arguments[xe];return p.prototype[y].apply(m,g)}}function t(){this.blockSize=-1}function i(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(i,t),i.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(v,p,_){_||(_=0);var m=Array(16);if(typeof p=="string")for(var y=0;16>y;++y)m[y]=p.charCodeAt(_++)|p.charCodeAt(_++)<<8|p.charCodeAt(_++)<<16|p.charCodeAt(_++)<<24;else for(y=0;16>y;++y)m[y]=p[_++]|p[_++]<<8|p[_++]<<16|p[_++]<<24;p=v.g[0],_=v.g[1],y=v.g[2];var w=v.g[3],g=p+(w^_&(y^w))+m[0]+3614090360&4294967295;p=_+(g<<7&4294967295|g>>>25),g=w+(y^p&(_^y))+m[1]+3905402710&4294967295,w=p+(g<<12&4294967295|g>>>20),g=y+(_^w&(p^_))+m[2]+606105819&4294967295,y=w+(g<<17&4294967295|g>>>15),g=_+(p^y&(w^p))+m[3]+3250441966&4294967295,_=y+(g<<22&4294967295|g>>>10),g=p+(w^_&(y^w))+m[4]+4118548399&4294967295,p=_+(g<<7&4294967295|g>>>25),g=w+(y^p&(_^y))+m[5]+1200080426&4294967295,w=p+(g<<12&4294967295|g>>>20),g=y+(_^w&(p^_))+m[6]+2821735955&4294967295,y=w+(g<<17&4294967295|g>>>15),g=_+(p^y&(w^p))+m[7]+4249261313&4294967295,_=y+(g<<22&4294967295|g>>>10),g=p+(w^_&(y^w))+m[8]+1770035416&4294967295,p=_+(g<<7&4294967295|g>>>25),g=w+(y^p&(_^y))+m[9]+2336552879&4294967295,w=p+(g<<12&4294967295|g>>>20),g=y+(_^w&(p^_))+m[10]+4294925233&4294967295,y=w+(g<<17&4294967295|g>>>15),g=_+(p^y&(w^p))+m[11]+2304563134&4294967295,_=y+(g<<22&4294967295|g>>>10),g=p+(w^_&(y^w))+m[12]+1804603682&4294967295,p=_+(g<<7&4294967295|g>>>25),g=w+(y^p&(_^y))+m[13]+4254626195&4294967295,w=p+(g<<12&4294967295|g>>>20),g=y+(_^w&(p^_))+m[14]+2792965006&4294967295,y=w+(g<<17&4294967295|g>>>15),g=_+(p^y&(w^p))+m[15]+1236535329&4294967295,_=y+(g<<22&4294967295|g>>>10),g=p+(y^w&(_^y))+m[1]+4129170786&4294967295,p=_+(g<<5&4294967295|g>>>27),g=w+(_^y&(p^_))+m[6]+3225465664&4294967295,w=p+(g<<9&4294967295|g>>>23),g=y+(p^_&(w^p))+m[11]+643717713&4294967295,y=w+(g<<14&4294967295|g>>>18),g=_+(w^p&(y^w))+m[0]+3921069994&4294967295,_=y+(g<<20&4294967295|g>>>12),g=p+(y^w&(_^y))+m[5]+3593408605&4294967295,p=_+(g<<5&4294967295|g>>>27),g=w+(_^y&(p^_))+m[10]+38016083&4294967295,w=p+(g<<9&4294967295|g>>>23),g=y+(p^_&(w^p))+m[15]+3634488961&4294967295,y=w+(g<<14&4294967295|g>>>18),g=_+(w^p&(y^w))+m[4]+3889429448&4294967295,_=y+(g<<20&4294967295|g>>>12),g=p+(y^w&(_^y))+m[9]+568446438&4294967295,p=_+(g<<5&4294967295|g>>>27),g=w+(_^y&(p^_))+m[14]+3275163606&4294967295,w=p+(g<<9&4294967295|g>>>23),g=y+(p^_&(w^p))+m[3]+4107603335&4294967295,y=w+(g<<14&4294967295|g>>>18),g=_+(w^p&(y^w))+m[8]+1163531501&4294967295,_=y+(g<<20&4294967295|g>>>12),g=p+(y^w&(_^y))+m[13]+2850285829&4294967295,p=_+(g<<5&4294967295|g>>>27),g=w+(_^y&(p^_))+m[2]+4243563512&4294967295,w=p+(g<<9&4294967295|g>>>23),g=y+(p^_&(w^p))+m[7]+1735328473&4294967295,y=w+(g<<14&4294967295|g>>>18),g=_+(w^p&(y^w))+m[12]+2368359562&4294967295,_=y+(g<<20&4294967295|g>>>12),g=p+(_^y^w)+m[5]+4294588738&4294967295,p=_+(g<<4&4294967295|g>>>28),g=w+(p^_^y)+m[8]+2272392833&4294967295,w=p+(g<<11&4294967295|g>>>21),g=y+(w^p^_)+m[11]+1839030562&4294967295,y=w+(g<<16&4294967295|g>>>16),g=_+(y^w^p)+m[14]+4259657740&4294967295,_=y+(g<<23&4294967295|g>>>9),g=p+(_^y^w)+m[1]+2763975236&4294967295,p=_+(g<<4&4294967295|g>>>28),g=w+(p^_^y)+m[4]+1272893353&4294967295,w=p+(g<<11&4294967295|g>>>21),g=y+(w^p^_)+m[7]+4139469664&4294967295,y=w+(g<<16&4294967295|g>>>16),g=_+(y^w^p)+m[10]+3200236656&4294967295,_=y+(g<<23&4294967295|g>>>9),g=p+(_^y^w)+m[13]+681279174&4294967295,p=_+(g<<4&4294967295|g>>>28),g=w+(p^_^y)+m[0]+3936430074&4294967295,w=p+(g<<11&4294967295|g>>>21),g=y+(w^p^_)+m[3]+3572445317&4294967295,y=w+(g<<16&4294967295|g>>>16),g=_+(y^w^p)+m[6]+76029189&4294967295,_=y+(g<<23&4294967295|g>>>9),g=p+(_^y^w)+m[9]+3654602809&4294967295,p=_+(g<<4&4294967295|g>>>28),g=w+(p^_^y)+m[12]+3873151461&4294967295,w=p+(g<<11&4294967295|g>>>21),g=y+(w^p^_)+m[15]+530742520&4294967295,y=w+(g<<16&4294967295|g>>>16),g=_+(y^w^p)+m[2]+3299628645&4294967295,_=y+(g<<23&4294967295|g>>>9),g=p+(y^(_|~w))+m[0]+4096336452&4294967295,p=_+(g<<6&4294967295|g>>>26),g=w+(_^(p|~y))+m[7]+1126891415&4294967295,w=p+(g<<10&4294967295|g>>>22),g=y+(p^(w|~_))+m[14]+2878612391&4294967295,y=w+(g<<15&4294967295|g>>>17),g=_+(w^(y|~p))+m[5]+4237533241&4294967295,_=y+(g<<21&4294967295|g>>>11),g=p+(y^(_|~w))+m[12]+1700485571&4294967295,p=_+(g<<6&4294967295|g>>>26),g=w+(_^(p|~y))+m[3]+2399980690&4294967295,w=p+(g<<10&4294967295|g>>>22),g=y+(p^(w|~_))+m[10]+4293915773&4294967295,y=w+(g<<15&4294967295|g>>>17),g=_+(w^(y|~p))+m[1]+2240044497&4294967295,_=y+(g<<21&4294967295|g>>>11),g=p+(y^(_|~w))+m[8]+1873313359&4294967295,p=_+(g<<6&4294967295|g>>>26),g=w+(_^(p|~y))+m[15]+4264355552&4294967295,w=p+(g<<10&4294967295|g>>>22),g=y+(p^(w|~_))+m[6]+2734768916&4294967295,y=w+(g<<15&4294967295|g>>>17),g=_+(w^(y|~p))+m[13]+1309151649&4294967295,_=y+(g<<21&4294967295|g>>>11),g=p+(y^(_|~w))+m[4]+4149444226&4294967295,p=_+(g<<6&4294967295|g>>>26),g=w+(_^(p|~y))+m[11]+3174756917&4294967295,w=p+(g<<10&4294967295|g>>>22),g=y+(p^(w|~_))+m[2]+718787259&4294967295,y=w+(g<<15&4294967295|g>>>17),g=_+(w^(y|~p))+m[9]+3951481745&4294967295,v.g[0]=v.g[0]+p&4294967295,v.g[1]=v.g[1]+(y+(g<<21&4294967295|g>>>11))&4294967295,v.g[2]=v.g[2]+y&4294967295,v.g[3]=v.g[3]+w&4294967295}i.prototype.u=function(v,p){p===void 0&&(p=v.length);for(var _=p-this.blockSize,m=this.B,y=this.h,w=0;w<p;){if(y==0)for(;w<=_;)r(this,v,w),w+=this.blockSize;if(typeof v=="string"){for(;w<p;)if(m[y++]=v.charCodeAt(w++),y==this.blockSize){r(this,m),y=0;break}}else for(;w<p;)if(m[y++]=v[w++],y==this.blockSize){r(this,m),y=0;break}}this.h=y,this.o+=p},i.prototype.v=function(){var v=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);v[0]=128;for(var p=1;p<v.length-8;++p)v[p]=0;var _=8*this.o;for(p=v.length-8;p<v.length;++p)v[p]=_&255,_/=256;for(this.u(v),v=Array(16),p=_=0;4>p;++p)for(var m=0;32>m;m+=8)v[_++]=this.g[p]>>>m&255;return v};function o(v,p){var _=c;return Object.prototype.hasOwnProperty.call(_,v)?_[v]:_[v]=p(v)}function l(v,p){this.h=p;for(var _=[],m=!0,y=v.length-1;0<=y;y--){var w=v[y]|0;m&&w==p||(_[y]=w,m=!1)}this.g=_}var c={};function d(v){return-128<=v&&128>v?o(v,function(p){return new l([p|0],0>p?-1:0)}):new l([v|0],0>v?-1:0)}function f(v){if(isNaN(v)||!isFinite(v))return I;if(0>v)return k(f(-v));for(var p=[],_=1,m=0;v>=_;m++)p[m]=v/_|0,_*=4294967296;return new l(p,0)}function T(v,p){if(v.length==0)throw Error("number format error: empty string");if(p=p||10,2>p||36<p)throw Error("radix out of range: "+p);if(v.charAt(0)=="-")return k(T(v.substring(1),p));if(0<=v.indexOf("-"))throw Error('number format error: interior "-" character');for(var _=f(Math.pow(p,8)),m=I,y=0;y<v.length;y+=8){var w=Math.min(8,v.length-y),g=parseInt(v.substring(y,y+w),p);8>w?(w=f(Math.pow(p,w)),m=m.j(w).add(f(g))):(m=m.j(_),m=m.add(f(g)))}return m}var I=d(0),S=d(1),N=d(16777216);n=l.prototype,n.m=function(){if(P(this))return-k(this).m();for(var v=0,p=1,_=0;_<this.g.length;_++){var m=this.i(_);v+=(0<=m?m:4294967296+m)*p,p*=4294967296}return v},n.toString=function(v){if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(R(this))return"0";if(P(this))return"-"+k(this).toString(v);for(var p=f(Math.pow(v,6)),_=this,m="";;){var y=me(_,p).g;_=_e(_,y.j(p));var w=((0<_.g.length?_.g[0]:_.h)>>>0).toString(v);if(_=y,R(_))return w+m;for(;6>w.length;)w="0"+w;m=w+m}},n.i=function(v){return 0>v?0:v<this.g.length?this.g[v]:this.h};function R(v){if(v.h!=0)return!1;for(var p=0;p<v.g.length;p++)if(v.g[p]!=0)return!1;return!0}function P(v){return v.h==-1}n.l=function(v){return v=_e(this,v),P(v)?-1:R(v)?0:1};function k(v){for(var p=v.g.length,_=[],m=0;m<p;m++)_[m]=~v.g[m];return new l(_,~v.h).add(S)}n.abs=function(){return P(this)?k(this):this},n.add=function(v){for(var p=Math.max(this.g.length,v.g.length),_=[],m=0,y=0;y<=p;y++){var w=m+(this.i(y)&65535)+(v.i(y)&65535),g=(w>>>16)+(this.i(y)>>>16)+(v.i(y)>>>16);m=g>>>16,w&=65535,g&=65535,_[y]=g<<16|w}return new l(_,_[_.length-1]&-2147483648?-1:0)};function _e(v,p){return v.add(k(p))}n.j=function(v){if(R(this)||R(v))return I;if(P(this))return P(v)?k(this).j(k(v)):k(k(this).j(v));if(P(v))return k(this.j(k(v)));if(0>this.l(N)&&0>v.l(N))return f(this.m()*v.m());for(var p=this.g.length+v.g.length,_=[],m=0;m<2*p;m++)_[m]=0;for(m=0;m<this.g.length;m++)for(var y=0;y<v.g.length;y++){var w=this.i(m)>>>16,g=this.i(m)&65535,xe=v.i(y)>>>16,an=v.i(y)&65535;_[2*m+2*y]+=g*an,Q(_,2*m+2*y),_[2*m+2*y+1]+=w*an,Q(_,2*m+2*y+1),_[2*m+2*y+1]+=g*xe,Q(_,2*m+2*y+1),_[2*m+2*y+2]+=w*xe,Q(_,2*m+2*y+2)}for(m=0;m<p;m++)_[m]=_[2*m+1]<<16|_[2*m];for(m=p;m<2*p;m++)_[m]=0;return new l(_,0)};function Q(v,p){for(;(v[p]&65535)!=v[p];)v[p+1]+=v[p]>>>16,v[p]&=65535,p++}function q(v,p){this.g=v,this.h=p}function me(v,p){if(R(p))throw Error("division by zero");if(R(v))return new q(I,I);if(P(v))return p=me(k(v),p),new q(k(p.g),k(p.h));if(P(p))return p=me(v,k(p)),new q(k(p.g),p.h);if(30<v.g.length){if(P(v)||P(p))throw Error("slowDivide_ only works with positive integers.");for(var _=S,m=p;0>=m.l(v);)_=lt(_),m=lt(m);var y=pe(_,1),w=pe(m,1);for(m=pe(m,2),_=pe(_,2);!R(m);){var g=w.add(m);0>=g.l(v)&&(y=y.add(_),w=g),m=pe(m,1),_=pe(_,1)}return p=_e(v,y.j(p)),new q(y,p)}for(y=I;0<=v.l(p);){for(_=Math.max(1,Math.floor(v.m()/p.m())),m=Math.ceil(Math.log(_)/Math.LN2),m=48>=m?1:Math.pow(2,m-48),w=f(_),g=w.j(p);P(g)||0<g.l(v);)_-=m,w=f(_),g=w.j(p);R(w)&&(w=S),y=y.add(w),v=_e(v,g)}return new q(y,v)}n.A=function(v){return me(this,v).h},n.and=function(v){for(var p=Math.max(this.g.length,v.g.length),_=[],m=0;m<p;m++)_[m]=this.i(m)&v.i(m);return new l(_,this.h&v.h)},n.or=function(v){for(var p=Math.max(this.g.length,v.g.length),_=[],m=0;m<p;m++)_[m]=this.i(m)|v.i(m);return new l(_,this.h|v.h)},n.xor=function(v){for(var p=Math.max(this.g.length,v.g.length),_=[],m=0;m<p;m++)_[m]=this.i(m)^v.i(m);return new l(_,this.h^v.h)};function lt(v){for(var p=v.g.length+1,_=[],m=0;m<p;m++)_[m]=v.i(m)<<1|v.i(m-1)>>>31;return new l(_,v.h)}function pe(v,p){var _=p>>5;p%=32;for(var m=v.g.length-_,y=[],w=0;w<m;w++)y[w]=0<p?v.i(w+_)>>>p|v.i(w+_+1)<<32-p:v.i(w+_);return new l(y,v.h)}i.prototype.digest=i.prototype.v,i.prototype.reset=i.prototype.s,i.prototype.update=i.prototype.u,l.prototype.add=l.prototype.add,l.prototype.multiply=l.prototype.j,l.prototype.modulo=l.prototype.A,l.prototype.compare=l.prototype.l,l.prototype.toNumber=l.prototype.m,l.prototype.toString=l.prototype.toString,l.prototype.getBits=l.prototype.i,l.fromNumber=f,l.fromString=T,vo=l}).apply(typeof yo<"u"?yo:typeof self<"u"?self:typeof window<"u"?window:{});var jn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(s,a,h){return s==Array.prototype||s==Object.prototype||(s[a]=h.value),s};function t(s){s=[typeof globalThis=="object"&&globalThis,s,typeof window=="object"&&window,typeof self=="object"&&self,typeof jn=="object"&&jn];for(var a=0;a<s.length;++a){var h=s[a];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var i=t(this);function r(s,a){if(a)e:{var h=i;s=s.split(".");for(var u=0;u<s.length-1;u++){var E=s[u];if(!(E in h))break e;h=h[E]}s=s[s.length-1],u=h[s],a=a(u),a!=u&&a!=null&&e(h,s,{configurable:!0,writable:!0,value:a})}}function o(s,a){s instanceof String&&(s+="");var h=0,u=!1,E={next:function(){if(!u&&h<s.length){var C=h++;return{value:a(C,s[C]),done:!1}}return u=!0,{done:!0,value:void 0}}};return E[Symbol.iterator]=function(){return E},E}r("Array.prototype.values",function(s){return s||function(){return o(this,function(a,h){return h})}});/** @license

   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  */var l=l||{},c=this||self;function d(s){var a=typeof s;return a=a!="object"?a:s?Array.isArray(s)?"array":a:"null",a=="array"||a=="object"&&typeof s.length=="number"}function f(s){var a=typeof s;return a=="object"&&s!=null||a=="function"}function T(s,a,h){return s.call.apply(s.bind,arguments)}function I(s,a,h){if(!s)throw Error();if(2<arguments.length){var u=Array.prototype.slice.call(arguments,2);return function(){var E=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(E,u),s.apply(a,E)}}return function(){return s.apply(a,arguments)}}function S(s,a,h){return S=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?T:I,S.apply(null,arguments)}function N(s,a){var h=Array.prototype.slice.call(arguments,1);return function(){var u=h.slice();return u.push.apply(u,arguments),s.apply(this,u)}}function R(s,a){function h(){}h.prototype=a.prototype,s.aa=a.prototype,s.prototype=new h,s.prototype.constructor=s,s.Qb=function(u,E,C){for(var b=Array(arguments.length-2),j=2;j<arguments.length;j++)b[j-2]=arguments[j];return a.prototype[E].apply(u,b)}}function P(s){const a=s.length;if(0<a){const h=Array(a);for(let u=0;u<a;u++)h[u]=s[u];return h}return[]}function k(s,a){for(let h=1;h<arguments.length;h++){const u=arguments[h];if(d(u)){const E=s.length||0,C=u.length||0;s.length=E+C;for(let b=0;b<C;b++)s[E+b]=u[b]}else s.push(u)}}class _e{constructor(a,h){this.i=a,this.j=h,this.h=0,this.g=null}get(){let a;return 0<this.h?(this.h--,a=this.g,this.g=a.next,a.next=null):a=this.i(),a}}function Q(s){return/^[\s\xa0]*$/.test(s)}function q(){var s=c.navigator;return s&&(s=s.userAgent)?s:""}function me(s){return me[" "](s),s}me[" "]=function(){};var lt=q().indexOf("Gecko")!=-1&&!(q().toLowerCase().indexOf("webkit")!=-1&&q().indexOf("Edge")==-1)&&!(q().indexOf("Trident")!=-1||q().indexOf("MSIE")!=-1)&&q().indexOf("Edge")==-1;function pe(s,a,h){for(const u in s)a.call(h,s[u],u,s)}function v(s,a){for(const h in s)a.call(void 0,s[h],h,s)}function p(s){const a={};for(const h in s)a[h]=s[h];return a}const _="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function m(s,a){let h,u;for(let E=1;E<arguments.length;E++){u=arguments[E];for(h in u)s[h]=u[h];for(let C=0;C<_.length;C++)h=_[C],Object.prototype.hasOwnProperty.call(u,h)&&(s[h]=u[h])}}function y(s){var a=1;s=s.split(":");const h=[];for(;0<a&&s.length;)h.push(s.shift()),a--;return s.length&&h.push(s.join(":")),h}function w(s){c.setTimeout(()=>{throw s},0)}function g(){var s=Hs;let a=null;return s.g&&(a=s.g,s.g=s.g.next,s.g||(s.h=null),a.next=null),a}class xe{constructor(){this.h=this.g=null}add(a,h){const u=an.get();u.set(a,h),this.h?this.h.next=u:this.g=u,this.h=u}}var an=new _e(()=>new Eg,s=>s.reset());class Eg{constructor(){this.next=this.g=this.h=null}set(a,h){this.h=a,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let ln,hn=!1,Hs=new xe,kl=()=>{const s=c.Promise.resolve(void 0);ln=()=>{s.then(wg)}};var wg=()=>{for(var s;s=g();){try{s.h.call(s.g)}catch(h){w(h)}var a=an;a.j(s),100>a.h&&(a.h++,s.next=a.g,a.g=s)}hn=!1};function Ke(){this.s=this.s,this.C=this.C}Ke.prototype.s=!1,Ke.prototype.ma=function(){this.s||(this.s=!0,this.N())},Ke.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function se(s,a){this.type=s,this.g=this.target=a,this.defaultPrevented=!1}se.prototype.h=function(){this.defaultPrevented=!0};var Ig=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var s=!1,a=Object.defineProperty({},"passive",{get:function(){s=!0}});try{const h=()=>{};c.addEventListener("test",h,a),c.removeEventListener("test",h,a)}catch{}return s}();function cn(s,a){if(se.call(this,s?s.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,s){var h=this.type=s.type,u=s.changedTouches&&s.changedTouches.length?s.changedTouches[0]:null;if(this.target=s.target||s.srcElement,this.g=a,a=s.relatedTarget){if(lt){e:{try{me(a.nodeName);var E=!0;break e}catch{}E=!1}E||(a=null)}}else h=="mouseover"?a=s.fromElement:h=="mouseout"&&(a=s.toElement);this.relatedTarget=a,u?(this.clientX=u.clientX!==void 0?u.clientX:u.pageX,this.clientY=u.clientY!==void 0?u.clientY:u.pageY,this.screenX=u.screenX||0,this.screenY=u.screenY||0):(this.clientX=s.clientX!==void 0?s.clientX:s.pageX,this.clientY=s.clientY!==void 0?s.clientY:s.pageY,this.screenX=s.screenX||0,this.screenY=s.screenY||0),this.button=s.button,this.key=s.key||"",this.ctrlKey=s.ctrlKey,this.altKey=s.altKey,this.shiftKey=s.shiftKey,this.metaKey=s.metaKey,this.pointerId=s.pointerId||0,this.pointerType=typeof s.pointerType=="string"?s.pointerType:Tg[s.pointerType]||"",this.state=s.state,this.i=s,s.defaultPrevented&&cn.aa.h.call(this)}}R(cn,se);var Tg={2:"touch",3:"pen",4:"mouse"};cn.prototype.h=function(){cn.aa.h.call(this);var s=this.i;s.preventDefault?s.preventDefault():s.returnValue=!1};var oi="closure_listenable_"+(1e6*Math.random()|0),Cg=0;function Sg(s,a,h,u,E){this.listener=s,this.proxy=null,this.src=a,this.type=h,this.capture=!!u,this.ha=E,this.key=++Cg,this.da=this.fa=!1}function ai(s){s.da=!0,s.listener=null,s.proxy=null,s.src=null,s.ha=null}function li(s){this.src=s,this.g={},this.h=0}li.prototype.add=function(s,a,h,u,E){var C=s.toString();s=this.g[C],s||(s=this.g[C]=[],this.h++);var b=Ws(s,a,u,E);return-1<b?(a=s[b],h||(a.fa=!1)):(a=new Sg(a,this.src,C,!!u,E),a.fa=h,s.push(a)),a};function js(s,a){var h=a.type;if(h in s.g){var u=s.g[h],E=Array.prototype.indexOf.call(u,a,void 0),C;(C=0<=E)&&Array.prototype.splice.call(u,E,1),C&&(ai(a),s.g[h].length==0&&(delete s.g[h],s.h--))}}function Ws(s,a,h,u){for(var E=0;E<s.length;++E){var C=s[E];if(!C.da&&C.listener==a&&C.capture==!!h&&C.ha==u)return E}return-1}var Vs="closure_lm_"+(1e6*Math.random()|0),zs={};function Pl(s,a,h,u,E){if(Array.isArray(a)){for(var C=0;C<a.length;C++)Pl(s,a[C],h,u,E);return null}return h=Ll(h),s&&s[oi]?s.K(a,h,f(u)?!!u.capture:!1,E):bg(s,a,h,!1,u,E)}function bg(s,a,h,u,E,C){if(!a)throw Error("Invalid event type");var b=f(E)?!!E.capture:!!E,j=Gs(s);if(j||(s[Vs]=j=new li(s)),h=j.add(a,h,u,b,C),h.proxy)return h;if(u=Ag(),h.proxy=u,u.src=s,u.listener=h,s.addEventListener)Ig||(E=b),E===void 0&&(E=!1),s.addEventListener(a.toString(),u,E);else if(s.attachEvent)s.attachEvent(Dl(a.toString()),u);else if(s.addListener&&s.removeListener)s.addListener(u);else throw Error("addEventListener and attachEvent are unavailable.");return h}function Ag(){function s(h){return a.call(s.src,s.listener,h)}const a=Rg;return s}function Ol(s,a,h,u,E){if(Array.isArray(a))for(var C=0;C<a.length;C++)Ol(s,a[C],h,u,E);else u=f(u)?!!u.capture:!!u,h=Ll(h),s&&s[oi]?(s=s.i,a=String(a).toString(),a in s.g&&(C=s.g[a],h=Ws(C,h,u,E),-1<h&&(ai(C[h]),Array.prototype.splice.call(C,h,1),C.length==0&&(delete s.g[a],s.h--)))):s&&(s=Gs(s))&&(a=s.g[a.toString()],s=-1,a&&(s=Ws(a,h,u,E)),(h=-1<s?a[s]:null)&&$s(h))}function $s(s){if(typeof s!="number"&&s&&!s.da){var a=s.src;if(a&&a[oi])js(a.i,s);else{var h=s.type,u=s.proxy;a.removeEventListener?a.removeEventListener(h,u,s.capture):a.detachEvent?a.detachEvent(Dl(h),u):a.addListener&&a.removeListener&&a.removeListener(u),(h=Gs(a))?(js(h,s),h.h==0&&(h.src=null,a[Vs]=null)):ai(s)}}}function Dl(s){return s in zs?zs[s]:zs[s]="on"+s}function Rg(s,a){if(s.da)s=!0;else{a=new cn(a,this);var h=s.listener,u=s.ha||s.src;s.fa&&$s(s),s=h.call(u,a)}return s}function Gs(s){return s=s[Vs],s instanceof li?s:null}var Ks="__closure_events_fn_"+(1e9*Math.random()>>>0);function Ll(s){return typeof s=="function"?s:(s[Ks]||(s[Ks]=function(a){return s.handleEvent(a)}),s[Ks])}function re(){Ke.call(this),this.i=new li(this),this.M=this,this.F=null}R(re,Ke),re.prototype[oi]=!0,re.prototype.removeEventListener=function(s,a,h,u){Ol(this,s,a,h,u)};function he(s,a){var h,u=s.F;if(u)for(h=[];u;u=u.F)h.push(u);if(s=s.M,u=a.type||a,typeof a=="string")a=new se(a,s);else if(a instanceof se)a.target=a.target||s;else{var E=a;a=new se(u,s),m(a,E)}if(E=!0,h)for(var C=h.length-1;0<=C;C--){var b=a.g=h[C];E=hi(b,u,!0,a)&&E}if(b=a.g=s,E=hi(b,u,!0,a)&&E,E=hi(b,u,!1,a)&&E,h)for(C=0;C<h.length;C++)b=a.g=h[C],E=hi(b,u,!1,a)&&E}re.prototype.N=function(){if(re.aa.N.call(this),this.i){var s=this.i,a;for(a in s.g){for(var h=s.g[a],u=0;u<h.length;u++)ai(h[u]);delete s.g[a],s.h--}}this.F=null},re.prototype.K=function(s,a,h,u){return this.i.add(String(s),a,!1,h,u)},re.prototype.L=function(s,a,h,u){return this.i.add(String(s),a,!0,h,u)};function hi(s,a,h,u){if(a=s.i.g[String(a)],!a)return!0;a=a.concat();for(var E=!0,C=0;C<a.length;++C){var b=a[C];if(b&&!b.da&&b.capture==h){var j=b.listener,ee=b.ha||b.src;b.fa&&js(s.i,b),E=j.call(ee,u)!==!1&&E}}return E&&!u.defaultPrevented}function Ml(s,a,h){if(typeof s=="function")h&&(s=S(s,h));else if(s&&typeof s.handleEvent=="function")s=S(s.handleEvent,s);else throw Error("Invalid listener argument");return 2147483647<Number(a)?-1:c.setTimeout(s,a||0)}function xl(s){s.g=Ml(()=>{s.g=null,s.i&&(s.i=!1,xl(s))},s.l);const a=s.h;s.h=null,s.m.apply(null,a)}class Ng extends Ke{constructor(a,h){super(),this.m=a,this.l=h,this.h=null,this.i=!1,this.g=null}j(a){this.h=arguments,this.g?this.i=!0:xl(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function un(s){Ke.call(this),this.h=s,this.g={}}R(un,Ke);var Fl=[];function Ul(s){pe(s.g,function(a,h){this.g.hasOwnProperty(h)&&$s(a)},s),s.g={}}un.prototype.N=function(){un.aa.N.call(this),Ul(this)},un.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var qs=c.JSON.stringify,kg=c.JSON.parse,Pg=class{stringify(s){return c.JSON.stringify(s,void 0)}parse(s){return c.JSON.parse(s,void 0)}};function Ys(){}Ys.prototype.h=null;function Bl(s){return s.h||(s.h=s.i())}function Og(){}var dn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Xs(){se.call(this,"d")}R(Xs,se);function Js(){se.call(this,"c")}R(Js,se);var At={},Hl=null;function Qs(){return Hl=Hl||new re}At.La="serverreachability";function jl(s){se.call(this,At.La,s)}R(jl,se);function fn(s){const a=Qs();he(a,new jl(a))}At.STAT_EVENT="statevent";function Wl(s,a){se.call(this,At.STAT_EVENT,s),this.stat=a}R(Wl,se);function ce(s){const a=Qs();he(a,new Wl(a,s))}At.Ma="timingevent";function Vl(s,a){se.call(this,At.Ma,s),this.size=a}R(Vl,se);function pn(s,a){if(typeof s!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){s()},a)}function gn(){this.g=!0}gn.prototype.xa=function(){this.g=!1};function Dg(s,a,h,u,E,C){s.info(function(){if(s.g)if(C)for(var b="",j=C.split("&"),ee=0;ee<j.length;ee++){var F=j[ee].split("=");if(1<F.length){var oe=F[0];F=F[1];var ae=oe.split("_");b=2<=ae.length&&ae[1]=="type"?b+(oe+"="+F+"&"):b+(oe+"=redacted&")}}else b=null;else b=C;return"XMLHTTP REQ ("+u+") [attempt "+E+"]: "+a+`
`+h+`
`+b})}function Lg(s,a,h,u,E,C,b){s.info(function(){return"XMLHTTP RESP ("+u+") [ attempt "+E+"]: "+a+`
`+h+`
`+C+" "+b})}function Rt(s,a,h,u){s.info(function(){return"XMLHTTP TEXT ("+a+"): "+xg(s,h)+(u?" "+u:"")})}function Mg(s,a){s.info(function(){return"TIMEOUT: "+a})}gn.prototype.info=function(){};function xg(s,a){if(!s.g)return a;if(!a)return null;try{var h=JSON.parse(a);if(h){for(s=0;s<h.length;s++)if(Array.isArray(h[s])){var u=h[s];if(!(2>u.length)){var E=u[1];if(Array.isArray(E)&&!(1>E.length)){var C=E[0];if(C!="noop"&&C!="stop"&&C!="close")for(var b=1;b<E.length;b++)E[b]=""}}}}return qs(h)}catch{return a}}var Zs={NO_ERROR:0,TIMEOUT:8},Fg={},er;function ci(){}R(ci,Ys),ci.prototype.g=function(){return new XMLHttpRequest},ci.prototype.i=function(){return{}},er=new ci;function qe(s,a,h,u){this.j=s,this.i=a,this.l=h,this.R=u||1,this.U=new un(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new zl}function zl(){this.i=null,this.g="",this.h=!1}var $l={},tr={};function nr(s,a,h){s.L=1,s.v=pi(Fe(a)),s.m=h,s.P=!0,Gl(s,null)}function Gl(s,a){s.F=Date.now(),ui(s),s.A=Fe(s.v);var h=s.A,u=s.R;Array.isArray(u)||(u=[String(u)]),oh(h.i,"t",u),s.C=0,h=s.j.J,s.h=new zl,s.g=Ch(s.j,h?a:null,!s.m),0<s.O&&(s.M=new Ng(S(s.Y,s,s.g),s.O)),a=s.U,h=s.g,u=s.ca;var E="readystatechange";Array.isArray(E)||(E&&(Fl[0]=E.toString()),E=Fl);for(var C=0;C<E.length;C++){var b=Pl(h,E[C],u||a.handleEvent,!1,a.h||a);if(!b)break;a.g[b.key]=b}a=s.H?p(s.H):{},s.m?(s.u||(s.u="POST"),a["Content-Type"]="application/x-www-form-urlencoded",s.g.ea(s.A,s.u,s.m,a)):(s.u="GET",s.g.ea(s.A,s.u,null,a)),fn(),Dg(s.i,s.u,s.A,s.l,s.R,s.m)}qe.prototype.ca=function(s){s=s.target;const a=this.M;a&&Ue(s)==3?a.j():this.Y(s)},qe.prototype.Y=function(s){try{if(s==this.g)e:{const ae=Ue(this.g);var a=this.g.Ba();const Pt=this.g.Z();if(!(3>ae)&&(ae!=3||this.g&&(this.h.h||this.g.oa()||fh(this.g)))){this.J||ae!=4||a==7||(a==8||0>=Pt?fn(3):fn(2)),ir(this);var h=this.g.Z();this.X=h;t:if(Kl(this)){var u=fh(this.g);s="";var E=u.length,C=Ue(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){ht(this),_n(this);var b="";break t}this.h.i=new c.TextDecoder}for(a=0;a<E;a++)this.h.h=!0,s+=this.h.i.decode(u[a],{stream:!(C&&a==E-1)});u.length=0,this.h.g+=s,this.C=0,b=this.h.g}else b=this.g.oa();if(this.o=h==200,Lg(this.i,this.u,this.A,this.l,this.R,ae,h),this.o){if(this.T&&!this.K){t:{if(this.g){var j,ee=this.g;if((j=ee.g?ee.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!Q(j)){var F=j;break t}}F=null}if(h=F)Rt(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,sr(this,h);else{this.o=!1,this.s=3,ce(12),ht(this),_n(this);break e}}if(this.P){h=!0;let be;for(;!this.J&&this.C<b.length;)if(be=Ug(this,b),be==tr){ae==4&&(this.s=4,ce(14),h=!1),Rt(this.i,this.l,null,"[Incomplete Response]");break}else if(be==$l){this.s=4,ce(15),Rt(this.i,this.l,b,"[Invalid Chunk]"),h=!1;break}else Rt(this.i,this.l,be,null),sr(this,be);if(Kl(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ae!=4||b.length!=0||this.h.h||(this.s=1,ce(16),h=!1),this.o=this.o&&h,!h)Rt(this.i,this.l,b,"[Invalid Chunked Response]"),ht(this),_n(this);else if(0<b.length&&!this.W){this.W=!0;var oe=this.j;oe.g==this&&oe.ba&&!oe.M&&(oe.j.info("Great, no buffering proxy detected. Bytes received: "+b.length),cr(oe),oe.M=!0,ce(11))}}else Rt(this.i,this.l,b,null),sr(this,b);ae==4&&ht(this),this.o&&!this.J&&(ae==4?Eh(this.j,this):(this.o=!1,ui(this)))}else t_(this.g),h==400&&0<b.indexOf("Unknown SID")?(this.s=3,ce(12)):(this.s=0,ce(13)),ht(this),_n(this)}}}catch{}finally{}};function Kl(s){return s.g?s.u=="GET"&&s.L!=2&&s.j.Ca:!1}function Ug(s,a){var h=s.C,u=a.indexOf(`
`,h);return u==-1?tr:(h=Number(a.substring(h,u)),isNaN(h)?$l:(u+=1,u+h>a.length?tr:(a=a.slice(u,u+h),s.C=u+h,a)))}qe.prototype.cancel=function(){this.J=!0,ht(this)};function ui(s){s.S=Date.now()+s.I,ql(s,s.I)}function ql(s,a){if(s.B!=null)throw Error("WatchDog timer not null");s.B=pn(S(s.ba,s),a)}function ir(s){s.B&&(c.clearTimeout(s.B),s.B=null)}qe.prototype.ba=function(){this.B=null;const s=Date.now();0<=s-this.S?(Mg(this.i,this.A),this.L!=2&&(fn(),ce(17)),ht(this),this.s=2,_n(this)):ql(this,this.S-s)};function _n(s){s.j.G==0||s.J||Eh(s.j,s)}function ht(s){ir(s);var a=s.M;a&&typeof a.ma=="function"&&a.ma(),s.M=null,Ul(s.U),s.g&&(a=s.g,s.g=null,a.abort(),a.ma())}function sr(s,a){try{var h=s.j;if(h.G!=0&&(h.g==s||rr(h.h,s))){if(!s.K&&rr(h.h,s)&&h.G==3){try{var u=h.Da.g.parse(a)}catch{u=null}if(Array.isArray(u)&&u.length==3){var E=u;if(E[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<s.F)Ei(h),yi(h);else break e;hr(h),ce(18)}}else h.za=E[1],0<h.za-h.T&&37500>E[2]&&h.F&&h.v==0&&!h.C&&(h.C=pn(S(h.Za,h),6e3));if(1>=Jl(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else ut(h,11)}else if((s.K||h.g==s)&&Ei(h),!Q(a))for(E=h.Da.g.parse(a),a=0;a<E.length;a++){let F=E[a];if(h.T=F[0],F=F[1],h.G==2)if(F[0]=="c"){h.K=F[1],h.ia=F[2];const oe=F[3];oe!=null&&(h.la=oe,h.j.info("VER="+h.la));const ae=F[4];ae!=null&&(h.Aa=ae,h.j.info("SVER="+h.Aa));const Pt=F[5];Pt!=null&&typeof Pt=="number"&&0<Pt&&(u=1.5*Pt,h.L=u,h.j.info("backChannelRequestTimeoutMs_="+u)),u=h;const be=s.g;if(be){const wi=be.g?be.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(wi){var C=u.h;C.g||wi.indexOf("spdy")==-1&&wi.indexOf("quic")==-1&&wi.indexOf("h2")==-1||(C.j=C.l,C.g=new Set,C.h&&(or(C,C.h),C.h=null))}if(u.D){const ur=be.g?be.g.getResponseHeader("X-HTTP-Session-Id"):null;ur&&(u.ya=ur,$(u.I,u.D,ur))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-s.F,h.j.info("Handshake RTT: "+h.R+"ms")),u=h;var b=s;if(u.qa=Th(u,u.J?u.ia:null,u.W),b.K){Ql(u.h,b);var j=b,ee=u.L;ee&&(j.I=ee),j.B&&(ir(j),ui(j)),u.g=b}else yh(u);0<h.i.length&&vi(h)}else F[0]!="stop"&&F[0]!="close"||ut(h,7);else h.G==3&&(F[0]=="stop"||F[0]=="close"?F[0]=="stop"?ut(h,7):lr(h):F[0]!="noop"&&h.l&&h.l.ta(F),h.v=0)}}fn(4)}catch{}}var Bg=class{constructor(s,a){this.g=s,this.map=a}};function Yl(s){this.l=s||10,c.PerformanceNavigationTiming?(s=c.performance.getEntriesByType("navigation"),s=0<s.length&&(s[0].nextHopProtocol=="hq"||s[0].nextHopProtocol=="h2")):s=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=s?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Xl(s){return s.h?!0:s.g?s.g.size>=s.j:!1}function Jl(s){return s.h?1:s.g?s.g.size:0}function rr(s,a){return s.h?s.h==a:s.g?s.g.has(a):!1}function or(s,a){s.g?s.g.add(a):s.h=a}function Ql(s,a){s.h&&s.h==a?s.h=null:s.g&&s.g.has(a)&&s.g.delete(a)}Yl.prototype.cancel=function(){if(this.i=Zl(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const s of this.g.values())s.cancel();this.g.clear()}};function Zl(s){if(s.h!=null)return s.i.concat(s.h.D);if(s.g!=null&&s.g.size!==0){let a=s.i;for(const h of s.g.values())a=a.concat(h.D);return a}return P(s.i)}function Hg(s){if(s.V&&typeof s.V=="function")return s.V();if(typeof Map<"u"&&s instanceof Map||typeof Set<"u"&&s instanceof Set)return Array.from(s.values());if(typeof s=="string")return s.split("");if(d(s)){for(var a=[],h=s.length,u=0;u<h;u++)a.push(s[u]);return a}a=[],h=0;for(u in s)a[h++]=s[u];return a}function jg(s){if(s.na&&typeof s.na=="function")return s.na();if(!s.V||typeof s.V!="function"){if(typeof Map<"u"&&s instanceof Map)return Array.from(s.keys());if(!(typeof Set<"u"&&s instanceof Set)){if(d(s)||typeof s=="string"){var a=[];s=s.length;for(var h=0;h<s;h++)a.push(h);return a}a=[],h=0;for(const u in s)a[h++]=u;return a}}}function eh(s,a){if(s.forEach&&typeof s.forEach=="function")s.forEach(a,void 0);else if(d(s)||typeof s=="string")Array.prototype.forEach.call(s,a,void 0);else for(var h=jg(s),u=Hg(s),E=u.length,C=0;C<E;C++)a.call(void 0,u[C],h&&h[C],s)}var th=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Wg(s,a){if(s){s=s.split("&");for(var h=0;h<s.length;h++){var u=s[h].indexOf("="),E=null;if(0<=u){var C=s[h].substring(0,u);E=s[h].substring(u+1)}else C=s[h];a(C,E?decodeURIComponent(E.replace(/\+/g," ")):"")}}}function ct(s){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,s instanceof ct){this.h=s.h,di(this,s.j),this.o=s.o,this.g=s.g,fi(this,s.s),this.l=s.l;var a=s.i,h=new vn;h.i=a.i,a.g&&(h.g=new Map(a.g),h.h=a.h),nh(this,h),this.m=s.m}else s&&(a=String(s).match(th))?(this.h=!1,di(this,a[1]||"",!0),this.o=mn(a[2]||""),this.g=mn(a[3]||"",!0),fi(this,a[4]),this.l=mn(a[5]||"",!0),nh(this,a[6]||"",!0),this.m=mn(a[7]||"")):(this.h=!1,this.i=new vn(null,this.h))}ct.prototype.toString=function(){var s=[],a=this.j;a&&s.push(yn(a,ih,!0),":");var h=this.g;return(h||a=="file")&&(s.push("//"),(a=this.o)&&s.push(yn(a,ih,!0),"@"),s.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&s.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&s.push("/"),s.push(yn(h,h.charAt(0)=="/"?$g:zg,!0))),(h=this.i.toString())&&s.push("?",h),(h=this.m)&&s.push("#",yn(h,Kg)),s.join("")};function Fe(s){return new ct(s)}function di(s,a,h){s.j=h?mn(a,!0):a,s.j&&(s.j=s.j.replace(/:$/,""))}function fi(s,a){if(a){if(a=Number(a),isNaN(a)||0>a)throw Error("Bad port number "+a);s.s=a}else s.s=null}function nh(s,a,h){a instanceof vn?(s.i=a,qg(s.i,s.h)):(h||(a=yn(a,Gg)),s.i=new vn(a,s.h))}function $(s,a,h){s.i.set(a,h)}function pi(s){return $(s,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),s}function mn(s,a){return s?a?decodeURI(s.replace(/%25/g,"%2525")):decodeURIComponent(s):""}function yn(s,a,h){return typeof s=="string"?(s=encodeURI(s).replace(a,Vg),h&&(s=s.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),s):null}function Vg(s){return s=s.charCodeAt(0),"%"+(s>>4&15).toString(16)+(s&15).toString(16)}var ih=/[#\/\?@]/g,zg=/[#\?:]/g,$g=/[#\?]/g,Gg=/[#\?@]/g,Kg=/#/g;function vn(s,a){this.h=this.g=null,this.i=s||null,this.j=!!a}function Ye(s){s.g||(s.g=new Map,s.h=0,s.i&&Wg(s.i,function(a,h){s.add(decodeURIComponent(a.replace(/\+/g," ")),h)}))}n=vn.prototype,n.add=function(s,a){Ye(this),this.i=null,s=Nt(this,s);var h=this.g.get(s);return h||this.g.set(s,h=[]),h.push(a),this.h+=1,this};function sh(s,a){Ye(s),a=Nt(s,a),s.g.has(a)&&(s.i=null,s.h-=s.g.get(a).length,s.g.delete(a))}function rh(s,a){return Ye(s),a=Nt(s,a),s.g.has(a)}n.forEach=function(s,a){Ye(this),this.g.forEach(function(h,u){h.forEach(function(E){s.call(a,E,u,this)},this)},this)},n.na=function(){Ye(this);const s=Array.from(this.g.values()),a=Array.from(this.g.keys()),h=[];for(let u=0;u<a.length;u++){const E=s[u];for(let C=0;C<E.length;C++)h.push(a[u])}return h},n.V=function(s){Ye(this);let a=[];if(typeof s=="string")rh(this,s)&&(a=a.concat(this.g.get(Nt(this,s))));else{s=Array.from(this.g.values());for(let h=0;h<s.length;h++)a=a.concat(s[h])}return a},n.set=function(s,a){return Ye(this),this.i=null,s=Nt(this,s),rh(this,s)&&(this.h-=this.g.get(s).length),this.g.set(s,[a]),this.h+=1,this},n.get=function(s,a){return s?(s=this.V(s),0<s.length?String(s[0]):a):a};function oh(s,a,h){sh(s,a),0<h.length&&(s.i=null,s.g.set(Nt(s,a),P(h)),s.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const s=[],a=Array.from(this.g.keys());for(var h=0;h<a.length;h++){var u=a[h];const C=encodeURIComponent(String(u)),b=this.V(u);for(u=0;u<b.length;u++){var E=C;b[u]!==""&&(E+="="+encodeURIComponent(String(b[u]))),s.push(E)}}return this.i=s.join("&")};function Nt(s,a){return a=String(a),s.j&&(a=a.toLowerCase()),a}function qg(s,a){a&&!s.j&&(Ye(s),s.i=null,s.g.forEach(function(h,u){var E=u.toLowerCase();u!=E&&(sh(this,u),oh(this,E,h))},s)),s.j=a}function Yg(s,a){const h=new gn;if(c.Image){const u=new Image;u.onload=N(Xe,h,"TestLoadImage: loaded",!0,a,u),u.onerror=N(Xe,h,"TestLoadImage: error",!1,a,u),u.onabort=N(Xe,h,"TestLoadImage: abort",!1,a,u),u.ontimeout=N(Xe,h,"TestLoadImage: timeout",!1,a,u),c.setTimeout(function(){u.ontimeout&&u.ontimeout()},1e4),u.src=s}else a(!1)}function Xg(s,a){const h=new gn,u=new AbortController,E=setTimeout(()=>{u.abort(),Xe(h,"TestPingServer: timeout",!1,a)},1e4);fetch(s,{signal:u.signal}).then(C=>{clearTimeout(E),C.ok?Xe(h,"TestPingServer: ok",!0,a):Xe(h,"TestPingServer: server error",!1,a)}).catch(()=>{clearTimeout(E),Xe(h,"TestPingServer: error",!1,a)})}function Xe(s,a,h,u,E){try{E&&(E.onload=null,E.onerror=null,E.onabort=null,E.ontimeout=null),u(h)}catch{}}function Jg(){this.g=new Pg}function Qg(s,a,h){const u=h||"";try{eh(s,function(E,C){let b=E;f(E)&&(b=qs(E)),a.push(u+C+"="+encodeURIComponent(b))})}catch(E){throw a.push(u+"type="+encodeURIComponent("_badmap")),E}}function gi(s){this.l=s.Ub||null,this.j=s.eb||!1}R(gi,Ys),gi.prototype.g=function(){return new _i(this.l,this.j)},gi.prototype.i=function(s){return function(){return s}}({});function _i(s,a){re.call(this),this.D=s,this.o=a,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}R(_i,re),n=_i.prototype,n.open=function(s,a){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=s,this.A=a,this.readyState=1,wn(this)},n.send=function(s){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const a={headers:this.u,method:this.B,credentials:this.m,cache:void 0};s&&(a.body=s),(this.D||c).fetch(new Request(this.A,a)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,En(this)),this.readyState=0},n.Sa=function(s){if(this.g&&(this.l=s,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=s.headers,this.readyState=2,wn(this)),this.g&&(this.readyState=3,wn(this),this.g)))if(this.responseType==="arraybuffer")s.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in s){if(this.j=s.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;ah(this)}else s.text().then(this.Ra.bind(this),this.ga.bind(this))};function ah(s){s.j.read().then(s.Pa.bind(s)).catch(s.ga.bind(s))}n.Pa=function(s){if(this.g){if(this.o&&s.value)this.response.push(s.value);else if(!this.o){var a=s.value?s.value:new Uint8Array(0);(a=this.v.decode(a,{stream:!s.done}))&&(this.response=this.responseText+=a)}s.done?En(this):wn(this),this.readyState==3&&ah(this)}},n.Ra=function(s){this.g&&(this.response=this.responseText=s,En(this))},n.Qa=function(s){this.g&&(this.response=s,En(this))},n.ga=function(){this.g&&En(this)};function En(s){s.readyState=4,s.l=null,s.j=null,s.v=null,wn(s)}n.setRequestHeader=function(s,a){this.u.append(s,a)},n.getResponseHeader=function(s){return this.h&&this.h.get(s.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const s=[],a=this.h.entries();for(var h=a.next();!h.done;)h=h.value,s.push(h[0]+": "+h[1]),h=a.next();return s.join(`\r
`)};function wn(s){s.onreadystatechange&&s.onreadystatechange.call(s)}Object.defineProperty(_i.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(s){this.m=s?"include":"same-origin"}});function lh(s){let a="";return pe(s,function(h,u){a+=u,a+=":",a+=h,a+=`\r
`}),a}function ar(s,a,h){e:{for(u in h){var u=!1;break e}u=!0}u||(h=lh(h),typeof s=="string"?h!=null&&encodeURIComponent(String(h)):$(s,a,h))}function K(s){re.call(this),this.headers=new Map,this.o=s||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}R(K,re);var Zg=/^https?$/i,e_=["POST","PUT"];n=K.prototype,n.Ha=function(s){this.J=s},n.ea=function(s,a,h,u){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+s);a=a?a.toUpperCase():"GET",this.D=s,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():er.g(),this.v=this.o?Bl(this.o):Bl(er),this.g.onreadystatechange=S(this.Ea,this);try{this.B=!0,this.g.open(a,String(s),!0),this.B=!1}catch(C){hh(this,C);return}if(s=h||"",h=new Map(this.headers),u)if(Object.getPrototypeOf(u)===Object.prototype)for(var E in u)h.set(E,u[E]);else if(typeof u.keys=="function"&&typeof u.get=="function")for(const C of u.keys())h.set(C,u.get(C));else throw Error("Unknown input type for opt_headers: "+String(u));u=Array.from(h.keys()).find(C=>C.toLowerCase()=="content-type"),E=c.FormData&&s instanceof c.FormData,!(0<=Array.prototype.indexOf.call(e_,a,void 0))||u||E||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[C,b]of h)this.g.setRequestHeader(C,b);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{dh(this),this.u=!0,this.g.send(s),this.u=!1}catch(C){hh(this,C)}};function hh(s,a){s.h=!1,s.g&&(s.j=!0,s.g.abort(),s.j=!1),s.l=a,s.m=5,ch(s),mi(s)}function ch(s){s.A||(s.A=!0,he(s,"complete"),he(s,"error"))}n.abort=function(s){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=s||7,he(this,"complete"),he(this,"abort"),mi(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),mi(this,!0)),K.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?uh(this):this.bb())},n.bb=function(){uh(this)};function uh(s){if(s.h&&typeof l<"u"&&(!s.v[1]||Ue(s)!=4||s.Z()!=2)){if(s.u&&Ue(s)==4)Ml(s.Ea,0,s);else if(he(s,"readystatechange"),Ue(s)==4){s.h=!1;try{const b=s.Z();e:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var a=!0;break e;default:a=!1}var h;if(!(h=a)){var u;if(u=b===0){var E=String(s.D).match(th)[1]||null;!E&&c.self&&c.self.location&&(E=c.self.location.protocol.slice(0,-1)),u=!Zg.test(E?E.toLowerCase():"")}h=u}if(h)he(s,"complete"),he(s,"success");else{s.m=6;try{var C=2<Ue(s)?s.g.statusText:""}catch{C=""}s.l=C+" ["+s.Z()+"]",ch(s)}}finally{mi(s)}}}}function mi(s,a){if(s.g){dh(s);const h=s.g,u=s.v[0]?()=>{}:null;s.g=null,s.v=null,a||he(s,"ready");try{h.onreadystatechange=u}catch{}}}function dh(s){s.I&&(c.clearTimeout(s.I),s.I=null)}n.isActive=function(){return!!this.g};function Ue(s){return s.g?s.g.readyState:0}n.Z=function(){try{return 2<Ue(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(s){if(this.g){var a=this.g.responseText;return s&&a.indexOf(s)==0&&(a=a.substring(s.length)),kg(a)}};function fh(s){try{if(!s.g)return null;if("response"in s.g)return s.g.response;switch(s.H){case"":case"text":return s.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in s.g)return s.g.mozResponseArrayBuffer}return null}catch{return null}}function t_(s){const a={};s=(s.g&&2<=Ue(s)&&s.g.getAllResponseHeaders()||"").split(`\r
`);for(let u=0;u<s.length;u++){if(Q(s[u]))continue;var h=y(s[u]);const E=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const C=a[E]||[];a[E]=C,C.push(h)}v(a,function(u){return u.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function In(s,a,h){return h&&h.internalChannelParams&&h.internalChannelParams[s]||a}function ph(s){this.Aa=0,this.i=[],this.j=new gn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=In("failFast",!1,s),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=In("baseRetryDelayMs",5e3,s),this.cb=In("retryDelaySeedMs",1e4,s),this.Wa=In("forwardChannelMaxRetries",2,s),this.wa=In("forwardChannelRequestTimeoutMs",2e4,s),this.pa=s&&s.xmlHttpFactory||void 0,this.Xa=s&&s.Tb||void 0,this.Ca=s&&s.useFetchStreams||!1,this.L=void 0,this.J=s&&s.supportsCrossDomainXhr||!1,this.K="",this.h=new Yl(s&&s.concurrentRequestLimit),this.Da=new Jg,this.P=s&&s.fastHandshake||!1,this.O=s&&s.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=s&&s.Rb||!1,s&&s.xa&&this.j.xa(),s&&s.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&s&&s.detectBufferingProxy||!1,this.ja=void 0,s&&s.longPollingTimeout&&0<s.longPollingTimeout&&(this.ja=s.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=ph.prototype,n.la=8,n.G=1,n.connect=function(s,a,h,u){ce(0),this.W=s,this.H=a||{},h&&u!==void 0&&(this.H.OSID=h,this.H.OAID=u),this.F=this.X,this.I=Th(this,null,this.W),vi(this)};function lr(s){if(gh(s),s.G==3){var a=s.U++,h=Fe(s.I);if($(h,"SID",s.K),$(h,"RID",a),$(h,"TYPE","terminate"),Tn(s,h),a=new qe(s,s.j,a),a.L=2,a.v=pi(Fe(h)),h=!1,c.navigator&&c.navigator.sendBeacon)try{h=c.navigator.sendBeacon(a.v.toString(),"")}catch{}!h&&c.Image&&(new Image().src=a.v,h=!0),h||(a.g=Ch(a.j,null),a.g.ea(a.v)),a.F=Date.now(),ui(a)}Ih(s)}function yi(s){s.g&&(cr(s),s.g.cancel(),s.g=null)}function gh(s){yi(s),s.u&&(c.clearTimeout(s.u),s.u=null),Ei(s),s.h.cancel(),s.s&&(typeof s.s=="number"&&c.clearTimeout(s.s),s.s=null)}function vi(s){if(!Xl(s.h)&&!s.s){s.s=!0;var a=s.Ga;ln||kl(),hn||(ln(),hn=!0),Hs.add(a,s),s.B=0}}function n_(s,a){return Jl(s.h)>=s.h.j-(s.s?1:0)?!1:s.s?(s.i=a.D.concat(s.i),!0):s.G==1||s.G==2||s.B>=(s.Va?0:s.Wa)?!1:(s.s=pn(S(s.Ga,s,a),wh(s,s.B)),s.B++,!0)}n.Ga=function(s){if(this.s)if(this.s=null,this.G==1){if(!s){this.U=Math.floor(1e5*Math.random()),s=this.U++;const E=new qe(this,this.j,s);let C=this.o;if(this.S&&(C?(C=p(C),m(C,this.S)):C=this.S),this.m!==null||this.O||(E.H=C,C=null),this.P)e:{for(var a=0,h=0;h<this.i.length;h++){t:{var u=this.i[h];if("__data__"in u.map&&(u=u.map.__data__,typeof u=="string")){u=u.length;break t}u=void 0}if(u===void 0)break;if(a+=u,4096<a){a=h;break e}if(a===4096||h===this.i.length-1){a=h+1;break e}}a=1e3}else a=1e3;a=mh(this,E,a),h=Fe(this.I),$(h,"RID",s),$(h,"CVER",22),this.D&&$(h,"X-HTTP-Session-Id",this.D),Tn(this,h),C&&(this.O?a="headers="+encodeURIComponent(String(lh(C)))+"&"+a:this.m&&ar(h,this.m,C)),or(this.h,E),this.Ua&&$(h,"TYPE","init"),this.P?($(h,"$req",a),$(h,"SID","null"),E.T=!0,nr(E,h,null)):nr(E,h,a),this.G=2}}else this.G==3&&(s?_h(this,s):this.i.length==0||Xl(this.h)||_h(this))};function _h(s,a){var h;a?h=a.l:h=s.U++;const u=Fe(s.I);$(u,"SID",s.K),$(u,"RID",h),$(u,"AID",s.T),Tn(s,u),s.m&&s.o&&ar(u,s.m,s.o),h=new qe(s,s.j,h,s.B+1),s.m===null&&(h.H=s.o),a&&(s.i=a.D.concat(s.i)),a=mh(s,h,1e3),h.I=Math.round(.5*s.wa)+Math.round(.5*s.wa*Math.random()),or(s.h,h),nr(h,u,a)}function Tn(s,a){s.H&&pe(s.H,function(h,u){$(a,u,h)}),s.l&&eh({},function(h,u){$(a,u,h)})}function mh(s,a,h){h=Math.min(s.i.length,h);var u=s.l?S(s.l.Na,s.l,s):null;e:{var E=s.i;let C=-1;for(;;){const b=["count="+h];C==-1?0<h?(C=E[0].g,b.push("ofs="+C)):C=0:b.push("ofs="+C);let j=!0;for(let ee=0;ee<h;ee++){let F=E[ee].g;const oe=E[ee].map;if(F-=C,0>F)C=Math.max(0,E[ee].g-100),j=!1;else try{Qg(oe,b,"req"+F+"_")}catch{u&&u(oe)}}if(j){u=b.join("&");break e}}}return s=s.i.splice(0,h),a.D=s,u}function yh(s){if(!s.g&&!s.u){s.Y=1;var a=s.Fa;ln||kl(),hn||(ln(),hn=!0),Hs.add(a,s),s.v=0}}function hr(s){return s.g||s.u||3<=s.v?!1:(s.Y++,s.u=pn(S(s.Fa,s),wh(s,s.v)),s.v++,!0)}n.Fa=function(){if(this.u=null,vh(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var s=2*this.R;this.j.info("BP detection timer enabled: "+s),this.A=pn(S(this.ab,this),s)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,ce(10),yi(this),vh(this))};function cr(s){s.A!=null&&(c.clearTimeout(s.A),s.A=null)}function vh(s){s.g=new qe(s,s.j,"rpc",s.Y),s.m===null&&(s.g.H=s.o),s.g.O=0;var a=Fe(s.qa);$(a,"RID","rpc"),$(a,"SID",s.K),$(a,"AID",s.T),$(a,"CI",s.F?"0":"1"),!s.F&&s.ja&&$(a,"TO",s.ja),$(a,"TYPE","xmlhttp"),Tn(s,a),s.m&&s.o&&ar(a,s.m,s.o),s.L&&(s.g.I=s.L);var h=s.g;s=s.ia,h.L=1,h.v=pi(Fe(a)),h.m=null,h.P=!0,Gl(h,s)}n.Za=function(){this.C!=null&&(this.C=null,yi(this),hr(this),ce(19))};function Ei(s){s.C!=null&&(c.clearTimeout(s.C),s.C=null)}function Eh(s,a){var h=null;if(s.g==a){Ei(s),cr(s),s.g=null;var u=2}else if(rr(s.h,a))h=a.D,Ql(s.h,a),u=1;else return;if(s.G!=0){if(a.o)if(u==1){h=a.m?a.m.length:0,a=Date.now()-a.F;var E=s.B;u=Qs(),he(u,new Vl(u,h)),vi(s)}else yh(s);else if(E=a.s,E==3||E==0&&0<a.X||!(u==1&&n_(s,a)||u==2&&hr(s)))switch(h&&0<h.length&&(a=s.h,a.i=a.i.concat(h)),E){case 1:ut(s,5);break;case 4:ut(s,10);break;case 3:ut(s,6);break;default:ut(s,2)}}}function wh(s,a){let h=s.Ta+Math.floor(Math.random()*s.cb);return s.isActive()||(h*=2),h*a}function ut(s,a){if(s.j.info("Error code "+a),a==2){var h=S(s.fb,s),u=s.Xa;const E=!u;u=new ct(u||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||di(u,"https"),pi(u),E?Yg(u.toString(),h):Xg(u.toString(),h)}else ce(2);s.G=0,s.l&&s.l.sa(a),Ih(s),gh(s)}n.fb=function(s){s?(this.j.info("Successfully pinged google.com"),ce(2)):(this.j.info("Failed to ping google.com"),ce(1))};function Ih(s){if(s.G=0,s.ka=[],s.l){const a=Zl(s.h);(a.length!=0||s.i.length!=0)&&(k(s.ka,a),k(s.ka,s.i),s.h.i.length=0,P(s.i),s.i.length=0),s.l.ra()}}function Th(s,a,h){var u=h instanceof ct?Fe(h):new ct(h);if(u.g!="")a&&(u.g=a+"."+u.g),fi(u,u.s);else{var E=c.location;u=E.protocol,a=a?a+"."+E.hostname:E.hostname,E=+E.port;var C=new ct(null);u&&di(C,u),a&&(C.g=a),E&&fi(C,E),h&&(C.l=h),u=C}return h=s.D,a=s.ya,h&&a&&$(u,h,a),$(u,"VER",s.la),Tn(s,u),u}function Ch(s,a,h){if(a&&!s.J)throw Error("Can't create secondary domain capable XhrIo object.");return a=s.Ca&&!s.pa?new K(new gi({eb:h})):new K(s.pa),a.Ha(s.J),a}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Sh(){}n=Sh.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function Ee(s,a){re.call(this),this.g=new ph(a),this.l=s,this.h=a&&a.messageUrlParams||null,s=a&&a.messageHeaders||null,a&&a.clientProtocolHeaderRequired&&(s?s["X-Client-Protocol"]="webchannel":s={"X-Client-Protocol":"webchannel"}),this.g.o=s,s=a&&a.initMessageHeaders||null,a&&a.messageContentType&&(s?s["X-WebChannel-Content-Type"]=a.messageContentType:s={"X-WebChannel-Content-Type":a.messageContentType}),a&&a.va&&(s?s["X-WebChannel-Client-Profile"]=a.va:s={"X-WebChannel-Client-Profile":a.va}),this.g.S=s,(s=a&&a.Sb)&&!Q(s)&&(this.g.m=s),this.v=a&&a.supportsCrossDomainXhr||!1,this.u=a&&a.sendRawJson||!1,(a=a&&a.httpSessionIdParam)&&!Q(a)&&(this.g.D=a,s=this.h,s!==null&&a in s&&(s=this.h,a in s&&delete s[a])),this.j=new kt(this)}R(Ee,re),Ee.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Ee.prototype.close=function(){lr(this.g)},Ee.prototype.o=function(s){var a=this.g;if(typeof s=="string"){var h={};h.__data__=s,s=h}else this.u&&(h={},h.__data__=qs(s),s=h);a.i.push(new Bg(a.Ya++,s)),a.G==3&&vi(a)},Ee.prototype.N=function(){this.g.l=null,delete this.j,lr(this.g),delete this.g,Ee.aa.N.call(this)};function bh(s){Xs.call(this),s.__headers__&&(this.headers=s.__headers__,this.statusCode=s.__status__,delete s.__headers__,delete s.__status__);var a=s.__sm__;if(a){e:{for(const h in a){s=h;break e}s=void 0}(this.i=s)&&(s=this.i,a=a!==null&&s in a?a[s]:void 0),this.data=a}else this.data=s}R(bh,Xs);function Ah(){Js.call(this),this.status=1}R(Ah,Js);function kt(s){this.g=s}R(kt,Sh),kt.prototype.ua=function(){he(this.g,"a")},kt.prototype.ta=function(s){he(this.g,new bh(s))},kt.prototype.sa=function(s){he(this.g,new Ah)},kt.prototype.ra=function(){he(this.g,"b")},Ee.prototype.send=Ee.prototype.o,Ee.prototype.open=Ee.prototype.m,Ee.prototype.close=Ee.prototype.close,Zs.NO_ERROR=0,Zs.TIMEOUT=8,Zs.HTTP_ERROR=6,Fg.COMPLETE="complete",Og.EventType=dn,dn.OPEN="a",dn.CLOSE="b",dn.ERROR="c",dn.MESSAGE="d",re.prototype.listen=re.prototype.K,K.prototype.listenOnce=K.prototype.L,K.prototype.getLastError=K.prototype.Ka,K.prototype.getLastErrorCode=K.prototype.Ba,K.prototype.getStatus=K.prototype.Z,K.prototype.getResponseJson=K.prototype.Oa,K.prototype.getResponseText=K.prototype.oa,K.prototype.send=K.prototype.ea,K.prototype.setWithCredentials=K.prototype.Ha}).apply(typeof jn<"u"?jn:typeof self<"u"?self:typeof window<"u"?window:{});const Eo="@firebase/firestore",wo="4.7.10";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class le{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}le.UNAUTHENTICATED=new le(null),le.GOOGLE_CREDENTIALS=new le("google-credentials-uid"),le.FIRST_PARTY=new le("first-party-uid"),le.MOCK_USER=new le("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Wt="11.5.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _t=new Rn("@firebase/firestore");function Ie(n,...e){if(_t.logLevel<=U.DEBUG){const t=e.map(Gi);_t.debug(`Firestore (${Wt}): ${n}`,...t)}}function Io(n,...e){if(_t.logLevel<=U.ERROR){const t=e.map(Gi);_t.error(`Firestore (${Wt}): ${n}`,...t)}}function ud(n,...e){if(_t.logLevel<=U.WARN){const t=e.map(Gi);_t.warn(`Firestore (${Wt}): ${n}`,...t)}}function Gi(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ki(n="Unexpected state"){const e=`FIRESTORE (${Wt}) INTERNAL ASSERTION FAILED: `+n;throw Io(e),new Error(e)}function Vt(n,e){n||Ki()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ue={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class de extends Be{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class To{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class dd{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(le.UNAUTHENTICATED))}shutdown(){}}class fd{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class pd{constructor(e){this.t=e,this.currentUser=le.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Vt(this.o===void 0);let i=this.i;const r=d=>this.i!==i?(i=this.i,t(d)):Promise.resolve();let o=new zt;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new zt,e.enqueueRetryable(()=>r(this.currentUser))};const l=()=>{const d=o;e.enqueueRetryable(async()=>{await d.promise,await r(this.currentUser)})},c=d=>{Ie("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=d,this.o&&(this.auth.addAuthTokenListener(this.o),l())};this.t.onInit(d=>c(d)),setTimeout(()=>{if(!this.auth){const d=this.t.getImmediate({optional:!0});d?c(d):(Ie("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new zt)}},0),l()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(i=>this.i!==e?(Ie("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):i?(Vt(typeof i.accessToken=="string"),new To(i.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Vt(e===null||typeof e=="string"),new le(e)}}class gd{constructor(e,t,i){this.l=e,this.h=t,this.P=i,this.type="FirstParty",this.user=le.FIRST_PARTY,this.T=new Map}I(){return this.P?this.P():null}get headers(){this.T.set("X-Goog-AuthUser",this.l);const e=this.I();return e&&this.T.set("Authorization",e),this.h&&this.T.set("X-Goog-Iam-Authorization-Token",this.h),this.T}}class _d{constructor(e,t,i){this.l=e,this.h=t,this.P=i}getToken(){return Promise.resolve(new gd(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(le.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Co{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class md{constructor(e,t){this.A=t,this.forceRefresh=!1,this.appCheck=null,this.R=null,this.V=null,Oe(e)&&e.settings.appCheckToken&&(this.V=e.settings.appCheckToken)}start(e,t){Vt(this.o===void 0);const i=o=>{o.error!=null&&Ie("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const l=o.token!==this.R;return this.R=o.token,Ie("FirebaseAppCheckTokenProvider",`Received ${l?"new":"existing"} token.`),l?t(o.token):Promise.resolve()};this.o=o=>{e.enqueueRetryable(()=>i(o))};const r=o=>{Ie("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(o=>r(o)),setTimeout(()=>{if(!this.appCheck){const o=this.A.getImmediate({optional:!0});o?r(o):Ie("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.V)return Promise.resolve(new Co(this.V));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(Vt(typeof t.token=="string"),this.R=t.token,new Co(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}function yd(n){return n.name==="IndexedDbTransactionError"}const qi="(default)";class Wn{constructor(e,t){this.projectId=e,this.database=t||qi}static empty(){return new Wn("","")}get isDefaultDatabase(){return this.database===qi}isEqual(e){return e instanceof Wn&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var So,L;(L=So||(So={}))[L.OK=0]="OK",L[L.CANCELLED=1]="CANCELLED",L[L.UNKNOWN=2]="UNKNOWN",L[L.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",L[L.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",L[L.NOT_FOUND=5]="NOT_FOUND",L[L.ALREADY_EXISTS=6]="ALREADY_EXISTS",L[L.PERMISSION_DENIED=7]="PERMISSION_DENIED",L[L.UNAUTHENTICATED=16]="UNAUTHENTICATED",L[L.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",L[L.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",L[L.ABORTED=10]="ABORTED",L[L.OUT_OF_RANGE=11]="OUT_OF_RANGE",L[L.UNIMPLEMENTED=12]="UNIMPLEMENTED",L[L.INTERNAL=13]="INTERNAL",L[L.UNAVAILABLE=14]="UNAVAILABLE",L[L.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new vo([4294967295,4294967295],0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vd=41943040;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ed=1048576;function Yi(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wd{constructor(e,t,i=1e3,r=1.5,o=6e4){this.Ti=e,this.timerId=t,this.Go=i,this.zo=r,this.jo=o,this.Ho=0,this.Jo=null,this.Yo=Date.now(),this.reset()}reset(){this.Ho=0}Zo(){this.Ho=this.jo}Xo(e){this.cancel();const t=Math.floor(this.Ho+this.e_()),i=Math.max(0,Date.now()-this.Yo),r=Math.max(0,t-i);r>0&&Ie("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.Ho} ms, delay with jitter: ${t} ms, last attempt: ${i} ms ago)`),this.Jo=this.Ti.enqueueAfterDelay(this.timerId,r,()=>(this.Yo=Date.now(),e())),this.Ho*=this.zo,this.Ho<this.Go&&(this.Ho=this.Go),this.Ho>this.jo&&(this.Ho=this.jo)}t_(){this.Jo!==null&&(this.Jo.skipDelay(),this.Jo=null)}cancel(){this.Jo!==null&&(this.Jo.cancel(),this.Jo=null)}e_(){return(Math.random()-.5)*this.Ho}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xi{constructor(e,t,i,r,o){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=i,this.op=r,this.removalCallback=o,this.deferred=new zt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(l=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,i,r,o){const l=Date.now()+i,c=new Xi(e,t,l,r,o);return c.start(i),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new de(ue.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var bo,Ao;(Ao=bo||(bo={}))._a="default",Ao.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Id(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ro=new Map;function Td(n,e,t,i){if(e===!0&&i===!0)throw new de(ue.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Cd(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(i){return i.constructor?i.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":Ki()}function Sd(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new de(ue.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Cd(n);throw new de(ue.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const No="firestore.googleapis.com",ko=!0;class Po{constructor(e){var t,i;if(e.host===void 0){if(e.ssl!==void 0)throw new de(ue.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=No,this.ssl=ko}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:ko;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=vd;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Ed)throw new de(ue.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Td("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Id((i=e.experimentalLongPollingOptions)!==null&&i!==void 0?i:{}),function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new de(ue.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new de(ue.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new de(ue.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(i,r){return i.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Oo{constructor(e,t,i,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=i,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Po({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new de(ue.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new de(ue.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Po(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(i){if(!i)return new dd;switch(i.type){case"firstParty":return new _d(i.sessionIndex||"0",i.iamToken||null,i.authTokenFactory||null);case"provider":return i.client;default:throw new de(ue.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const i=Ro.get(t);i&&(Ie("ComponentProvider","Removing Datastore"),Ro.delete(t),i.terminate())}(this),Promise.resolve()}}function bd(n,e,t,i={}){var r;const o=(n=Sd(n,Oo))._getSettings(),l=Object.assign(Object.assign({},o),{emulatorOptions:n._getEmulatorOptions()}),c=`${e}:${t}`;o.host!==No&&o.host!==c&&ud("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const d=Object.assign(Object.assign({},o),{host:c,ssl:!1,emulatorOptions:i});if(!He(d,l)&&(n._setSettings(d),i.mockUserToken)){let f,T;if(typeof i.mockUserToken=="string")f=i.mockUserToken,T=le.MOCK_USER;else{f=Er(i.mockUserToken,(r=n._app)===null||r===void 0?void 0:r.options.projectId);const I=i.mockUserToken.sub||i.mockUserToken.user_id;if(!I)throw new de(ue.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");T=new le(I)}n._authCredentials=new fd(new To(f,T))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Do="AsyncQueue";class Lo{constructor(e=Promise.resolve()){this.Vu=[],this.mu=!1,this.fu=[],this.gu=null,this.pu=!1,this.yu=!1,this.wu=[],this.a_=new wd(this,"async_queue_retry"),this.Su=()=>{const i=Yi();i&&Ie(Do,"Visibility state changed to "+i.visibilityState),this.a_.t_()},this.bu=e;const t=Yi();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Su)}get isShuttingDown(){return this.mu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Du(),this.vu(e)}enterRestrictedMode(e){if(!this.mu){this.mu=!0,this.yu=e||!1;const t=Yi();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Su)}}enqueue(e){if(this.Du(),this.mu)return new Promise(()=>{});const t=new zt;return this.vu(()=>this.mu&&this.yu?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Vu.push(e),this.Cu()))}async Cu(){if(this.Vu.length!==0){try{await this.Vu[0](),this.Vu.shift(),this.a_.reset()}catch(e){if(!yd(e))throw e;Ie(Do,"Operation failed with retryable error: "+e)}this.Vu.length>0&&this.a_.Xo(()=>this.Cu())}}vu(e){const t=this.bu.then(()=>(this.pu=!0,e().catch(i=>{this.gu=i,this.pu=!1;const r=function(l){let c=l.message||"";return l.stack&&(c=l.stack.includes(l.message)?l.stack:l.message+`
`+l.stack),c}(i);throw Io("INTERNAL UNHANDLED ERROR: ",r),i}).then(i=>(this.pu=!1,i))));return this.bu=t,t}enqueueAfterDelay(e,t,i){this.Du(),this.wu.indexOf(e)>-1&&(t=0);const r=Xi.createAndSchedule(this,e,t,i,o=>this.Fu(o));return this.fu.push(r),r}Du(){this.gu&&Ki()}verifyOperationInProgress(){}async Mu(){let e;do e=this.bu,await e;while(e!==this.bu)}xu(e){for(const t of this.fu)if(t.timerId===e)return!0;return!1}Ou(e){return this.Mu().then(()=>{this.fu.sort((t,i)=>t.targetTimeMs-i.targetTimeMs);for(const t of this.fu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Mu()})}Nu(e){this.wu.push(e)}Fu(e){const t=this.fu.indexOf(e);this.fu.splice(t,1)}}class Ad extends Oo{constructor(e,t,i,r){super(e,t,i,r),this.type="firestore",this._queue=new Lo,this._persistenceKey=(r==null?void 0:r.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Lo(e),this._firestoreClient=void 0,await e}}}function Rd(n,e){const t=typeof n=="object"?n:xi(),i=typeof n=="string"?n:qi,r=Nn(t,"firestore").getImmediate({identifier:i});if(!r._initialized){const o=yr("firestore");o&&bd(r,...o)}return r}(function(e,t=!0){(function(r){Wt=r})(Mt),Ze(new je("firestore",(i,{instanceIdentifier:r,options:o})=>{const l=i.getProvider("app").getImmediate(),c=new Ad(new pd(i.getProvider("auth-internal")),new md(l,i.getProvider("app-check-internal")),function(f,T){if(!Object.prototype.hasOwnProperty.apply(f.options,["projectId"]))throw new de(ue.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Wn(f.options.projectId,T)}(l,r),l);return o=Object.assign({useFetchStreams:t},o),c._setSettings(o),c},"PUBLIC").setMultipleInstances(!0)),Re(Eo,wo,e),Re(Eo,wo,"esm2017")})();const Mo="@firebase/database",xo="1.0.14";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Fo="";function Nd(n){Fo=n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kd{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),Z(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:Dt(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pd{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return ke(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uo=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new kd(e)}}catch{}return new Pd},tt=Uo("localStorage"),Od=Uo("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mt=new Rn("@firebase/database"),Dd=function(){let n=1;return function(){return n++}}(),Bo=function(n){const e=Zh(n),t=new qh;t.update(e);const i=t.digest();return Ii.encodeByteArray(i)},$t=function(...n){let e="";for(let t=0;t<n.length;t++){const i=n[t];Array.isArray(i)||i&&typeof i=="object"&&typeof i.length=="number"?e+=$t.apply(null,i):typeof i=="object"?e+=Z(i):e+=i,e+=" "}return e};let Gt=null,Ho=!0;const Ld=function(n,e){A(!0,"Can't turn on custom loggers persistently."),mt.logLevel=U.VERBOSE,Gt=mt.log.bind(mt)},te=function(...n){if(Ho===!0&&(Ho=!1,Gt===null&&Od.get("logging_enabled")===!0&&Ld()),Gt){const e=$t.apply(null,n);Gt(e)}},Kt=function(n){return function(...e){te(n,...e)}},Ji=function(...n){const e="FIREBASE INTERNAL ERROR: "+$t(...n);mt.error(e)},De=function(...n){const e=`FIREBASE FATAL ERROR: ${$t(...n)}`;throw mt.error(e),new Error(e)},ge=function(...n){const e="FIREBASE WARNING: "+$t(...n);mt.warn(e)},Md=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&ge("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},jo=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},xd=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},yt="[MIN_NAME]",nt="[MAX_NAME]",vt=function(n,e){if(n===e)return 0;if(n===yt||e===nt)return-1;if(e===yt||n===nt)return 1;{const t=zo(n),i=zo(e);return t!==null?i!==null?t-i===0?n.length-e.length:t-i:-1:i!==null?1:n<e?-1:1}},Fd=function(n,e){return n===e?0:n<e?-1:1},qt=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+Z(e))},Qi=function(n){if(typeof n!="object"||n===null)return Z(n);const e=[];for(const i in n)e.push(i);e.sort();let t="{";for(let i=0;i<e.length;i++)i!==0&&(t+=","),t+=Z(e[i]),t+=":",t+=Qi(n[e[i]]);return t+="}",t},Wo=function(n,e){const t=n.length;if(t<=e)return[n];const i=[];for(let r=0;r<t;r+=e)r+e>t?i.push(n.substring(r,t)):i.push(n.substring(r,r+e));return i};function ye(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const Vo=function(n){A(!jo(n),"Invalid JSON number");const e=11,t=52,i=(1<<e-1)-1;let r,o,l,c,d;n===0?(o=0,l=0,r=1/n===-1/0?1:0):(r=n<0,n=Math.abs(n),n>=Math.pow(2,1-i)?(c=Math.min(Math.floor(Math.log(n)/Math.LN2),i),o=c+i,l=Math.round(n*Math.pow(2,t-c)-Math.pow(2,t))):(o=0,l=Math.round(n/Math.pow(2,1-i-t))));const f=[];for(d=t;d;d-=1)f.push(l%2?1:0),l=Math.floor(l/2);for(d=e;d;d-=1)f.push(o%2?1:0),o=Math.floor(o/2);f.push(r?1:0),f.reverse();const T=f.join("");let I="";for(d=0;d<64;d+=8){let S=parseInt(T.substr(d,8),2).toString(16);S.length===1&&(S="0"+S),I=I+S}return I.toLowerCase()},Ud=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},Bd=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"},Hd=new RegExp("^-?(0*)\\d{1,10}$"),jd=-2147483648,Wd=2147483647,zo=function(n){if(Hd.test(n)){const e=Number(n);if(e>=jd&&e<=Wd)return e}return null},Yt=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw ge("Exception was thrown by user callback.",t),e},Math.floor(0))}},Vd=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},Xt=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zd{constructor(e,t){this.appCheckProvider=t,this.appName=e.name,Oe(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(i=>this.appCheck=i)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((t,i)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,i):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)===null||t===void 0||t.get().then(i=>i.addTokenListener(e))}notifyForInvalidToken(){ge(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $d{constructor(e,t,i){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=i,this.auth_=null,this.auth_=i.getImmediate({optional:!0}),this.auth_||i.onInit(r=>this.auth_=r)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(te("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,i)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,i):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',ge(e)}}class Vn{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}Vn.OWNER="owner";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zi="5",$o="v",Go="s",Ko="r",qo="f",Yo=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,Xo="ls",Jo="p",es="ac",Qo="websocket",Zo="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ea{constructor(e,t,i,r,o=!1,l="",c=!1,d=!1,f=null){this.secure=t,this.namespace=i,this.webSocketOnly=r,this.nodeAdmin=o,this.persistenceKey=l,this.includeNamespaceInQueryParams=c,this.isUsingEmulator=d,this.emulatorOptions=f,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=tt.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&tt.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function Gd(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function ta(n,e,t){A(typeof e=="string","typeof type must == string"),A(typeof t=="object","typeof params must == object");let i;if(e===Qo)i=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===Zo)i=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);Gd(n)&&(t.ns=n.namespace);const r=[];return ye(t,(o,l)=>{r.push(o+"="+l)}),i+r.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kd{constructor(){this.counters_={}}incrementCounter(e,t=1){ke(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return Oh(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ts={},ns={};function is(n){const e=n.toString();return ts[e]||(ts[e]=new Kd),ts[e]}function qd(n,e){const t=n.toString();return ns[t]||(ns[t]=e()),ns[t]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yd{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const i=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let r=0;r<i.length;++r)i[r]&&Yt(()=>{this.onMessage_(i[r])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const na="start",Xd="close",Jd="pLPCommand",Qd="pRTLPCB",ia="id",sa="pw",ra="ser",Zd="cb",ef="seg",tf="ts",nf="d",sf="dframe",oa=1870,aa=30,rf=oa-aa,of=25e3,af=3e4;class Et{constructor(e,t,i,r,o,l,c){this.connId=e,this.repoInfo=t,this.applicationId=i,this.appCheckToken=r,this.authToken=o,this.transportSessionId=l,this.lastSessionId=c,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=Kt(e),this.stats_=is(t),this.urlFn=d=>(this.appCheckToken&&(d[es]=this.appCheckToken),ta(t,Zo,d))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new Yd(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(af)),xd(()=>{if(this.isClosed_)return;this.scriptTagHolder=new ss((...o)=>{const[l,c,d,f,T]=o;if(this.incrementIncomingBytes_(o),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,l===na)this.id=c,this.password=d;else if(l===Xd)c?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(c,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+l)},(...o)=>{const[l,c]=o;this.incrementIncomingBytes_(o),this.myPacketOrderer.handleResponse(l,c)},()=>{this.onClosed_()},this.urlFn);const i={};i[na]="t",i[ra]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(i[Zd]=this.scriptTagHolder.uniqueCallbackIdentifier),i[$o]=Zi,this.transportSessionId&&(i[Go]=this.transportSessionId),this.lastSessionId&&(i[Xo]=this.lastSessionId),this.applicationId&&(i[Jo]=this.applicationId),this.appCheckToken&&(i[es]=this.appCheckToken),typeof location<"u"&&location.hostname&&Yo.test(location.hostname)&&(i[Ko]=qo);const r=this.urlFn(i);this.log_("Connecting via long-poll to "+r),this.scriptTagHolder.addTag(r,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){Et.forceAllow_=!0}static forceDisallow(){Et.forceDisallow_=!0}static isAvailable(){return Et.forceAllow_?!0:!Et.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!Ud()&&!Bd()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=Z(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const i=pr(t),r=Wo(i,rf);for(let o=0;o<r.length;o++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,r.length,r[o]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const i={};i[sf]="t",i[ia]=e,i[sa]=t,this.myDisconnFrame.src=this.urlFn(i),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=Z(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class ss{constructor(e,t,i,r){this.onDisconnect=i,this.urlFn=r,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=Dd(),window[Jd+this.uniqueCallbackIdentifier]=e,window[Qd+this.uniqueCallbackIdentifier]=t,this.myIFrame=ss.createIFrame_();let o="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(o='<script>document.domain="'+document.domain+'";<\/script>');const l="<html><body>"+o+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(l),this.myIFrame.doc.close()}catch(c){te("frame writing exception"),c.stack&&te(c.stack),te(c)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||te("No IE domain setting required")}catch{const i=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+i+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[ia]=this.myID,e[sa]=this.myPW,e[ra]=this.currentSerial;let t=this.urlFn(e),i="",r=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+aa+i.length<=oa;){const l=this.pendingSegs.shift();i=i+"&"+ef+r+"="+l.seg+"&"+tf+r+"="+l.ts+"&"+nf+r+"="+l.d,r++}return t=t+i,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,i){this.pendingSegs.push({seg:e,ts:t,d:i}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const i=()=>{this.outstandingRequests.delete(t),this.newRequest_()},r=setTimeout(i,Math.floor(of)),o=()=>{clearTimeout(r),i()};this.addTag(e,o)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const i=this.myIFrame.doc.createElement("script");i.type="text/javascript",i.async=!0,i.src=e,i.onload=i.onreadystatechange=function(){const r=i.readyState;(!r||r==="loaded"||r==="complete")&&(i.onload=i.onreadystatechange=null,i.parentNode&&i.parentNode.removeChild(i),t())},i.onerror=()=>{te("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(i)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lf=16384,hf=45e3;let zn=null;typeof MozWebSocket<"u"?zn=MozWebSocket:typeof WebSocket<"u"&&(zn=WebSocket);class Te{constructor(e,t,i,r,o,l,c){this.connId=e,this.applicationId=i,this.appCheckToken=r,this.authToken=o,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=Kt(this.connId),this.stats_=is(t),this.connURL=Te.connectionURL_(t,l,c,r,i),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,i,r,o){const l={};return l[$o]=Zi,typeof location<"u"&&location.hostname&&Yo.test(location.hostname)&&(l[Ko]=qo),t&&(l[Go]=t),i&&(l[Xo]=i),r&&(l[es]=r),o&&(l[Jo]=o),ta(e,Qo,l)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,tt.set("previous_websocket_failure",!0);try{let i;Hh(),this.mySock=new zn(this.connURL,[],i)}catch(i){this.log_("Error instantiating WebSocket.");const r=i.message||i.data;r&&this.log_(r),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=i=>{this.handleIncomingFrame(i)},this.mySock.onerror=i=>{this.log_("WebSocket error.  Closing connection.");const r=i.message||i.data;r&&this.log_(r),this.onClosed_()}}start(){}static forceDisallow(){Te.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,i=navigator.userAgent.match(t);i&&i.length>1&&parseFloat(i[1])<4.4&&(e=!0)}return!e&&zn!==null&&!Te.forceDisallow_}static previouslyFailed(){return tt.isInMemoryStorage||tt.get("previous_websocket_failure")===!0}markConnectionHealthy(){tt.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const i=Dt(t);this.onMessage(i)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(A(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const i=this.extractFrameCount_(t);i!==null&&this.appendFrame_(i)}}send(e){this.resetKeepAlive();const t=Z(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const i=Wo(t,lf);i.length>1&&this.sendString_(String(i.length));for(let r=0;r<i.length;r++)this.sendString_(i[r])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(hf))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}Te.responsesRequiredToBeHealthy=2,Te.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jt{static get ALL_TRANSPORTS(){return[Et,Te]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const t=Te&&Te.isAvailable();let i=t&&!Te.previouslyFailed();if(e.webSocketOnly&&(t||ge("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),i=!0),i)this.transports_=[Te];else{const r=this.transports_=[];for(const o of Jt.ALL_TRANSPORTS)o&&o.isAvailable()&&r.push(o);Jt.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}Jt.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cf=6e4,uf=5e3,df=10*1024,ff=100*1024,rs="t",la="d",pf="s",ha="r",gf="e",ca="o",ua="a",da="n",fa="p",_f="h";class mf{constructor(e,t,i,r,o,l,c,d,f,T){this.id=e,this.repoInfo_=t,this.applicationId_=i,this.appCheckToken_=r,this.authToken_=o,this.onMessage_=l,this.onReady_=c,this.onDisconnect_=d,this.onKill_=f,this.lastSessionId=T,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=Kt("c:"+this.id+":"),this.transportManager_=new Jt(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),i=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,i)},Math.floor(0));const r=e.healthyTimeout||0;r>0&&(this.healthyTimeout_=Xt(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>ff?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>df?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(r)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(rs in e){const t=e[rs];t===ua?this.upgradeIfSecondaryHealthy_():t===ha?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===ca&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=qt("t",e),i=qt("d",e);if(t==="c")this.onSecondaryControl_(i);else if(t==="d")this.pendingDataMessages.push(i);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:fa,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:ua,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:da,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=qt("t",e),i=qt("d",e);t==="c"?this.onControl_(i):t==="d"&&this.onDataMessage_(i)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=qt(rs,e);if(la in e){const i=e[la];if(t===_f){const r=Object.assign({},i);this.repoInfo_.isUsingEmulator&&(r.h=this.repoInfo_.host),this.onHandshake_(r)}else if(t===da){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let r=0;r<this.pendingDataMessages.length;++r)this.onDataMessage_(this.pendingDataMessages[r]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===pf?this.onConnectionShutdown_(i):t===ha?this.onReset_(i):t===gf?Ji("Server Error: "+i):t===ca?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):Ji("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,i=e.v,r=e.h;this.sessionId=e.s,this.repoInfo_.host=r,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),Zi!==i&&ge("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),i=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,i),Xt(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(cf))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):Xt(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(uf))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:fa,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(tt.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pa{put(e,t,i,r){}merge(e,t,i,r){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,i){}onDisconnectMerge(e,t,i){}onDisconnectCancel(e,t){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ga{constructor(e){this.allowedEvents_=e,this.listeners_={},A(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const i=[...this.listeners_[e]];for(let r=0;r<i.length;r++)i[r].callback.apply(i[r].context,t)}}on(e,t,i){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:i});const r=this.getInitialEvent(e);r&&t.apply(i,r)}off(e,t,i){this.validateEventType_(e);const r=this.listeners_[e]||[];for(let o=0;o<r.length;o++)if(r[o].callback===t&&(!i||i===r[o].context)){r.splice(o,1);return}}validateEventType_(e){A(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $n extends ga{static getInstance(){return new $n}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!Ci()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return A(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _a=32,ma=768;class W{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let i=0;for(let r=0;r<this.pieces_.length;r++)this.pieces_[r].length>0&&(this.pieces_[i]=this.pieces_[r],i++);this.pieces_.length=i,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function H(){return new W("")}function M(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function $e(n){return n.pieces_.length-n.pieceNum_}function V(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new W(n.pieces_,e)}function ya(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function yf(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function va(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function Ea(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new W(e,0)}function Y(n,e){const t=[];for(let i=n.pieceNum_;i<n.pieces_.length;i++)t.push(n.pieces_[i]);if(e instanceof W)for(let i=e.pieceNum_;i<e.pieces_.length;i++)t.push(e.pieces_[i]);else{const i=e.split("/");for(let r=0;r<i.length;r++)i[r].length>0&&t.push(i[r])}return new W(t,0)}function O(n){return n.pieceNum_>=n.pieces_.length}function ve(n,e){const t=M(n),i=M(e);if(t===null)return e;if(t===i)return ve(V(n),V(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function wa(n,e){if($e(n)!==$e(e))return!1;for(let t=n.pieceNum_,i=e.pieceNum_;t<=n.pieces_.length;t++,i++)if(n.pieces_[t]!==e.pieces_[i])return!1;return!0}function Ce(n,e){let t=n.pieceNum_,i=e.pieceNum_;if($e(n)>$e(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[i])return!1;++t,++i}return!0}class vf{constructor(e,t){this.errorPrefix_=t,this.parts_=va(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let i=0;i<this.parts_.length;i++)this.byteLength_+=An(this.parts_[i]);Ia(this)}}function Ef(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=An(e),Ia(n)}function wf(n){const e=n.parts_.pop();n.byteLength_-=An(e),n.parts_.length>0&&(n.byteLength_-=1)}function Ia(n){if(n.byteLength_>ma)throw new Error(n.errorPrefix_+"has a key path longer than "+ma+" bytes ("+n.byteLength_+").");if(n.parts_.length>_a)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+_a+") or object contains a cycle "+it(n))}function it(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class os extends ga{static getInstance(){return new os}constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const i=!document[e];i!==this.visible_&&(this.visible_=i,this.trigger("visible",i))},!1)}getInitialEvent(e){return A(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qt=1e3,If=60*5*1e3,Ta=30*1e3,Tf=1.3,Cf=3e4,Sf="server_kill",Ca=3;class Le extends pa{constructor(e,t,i,r,o,l,c,d){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=i,this.onConnectStatus_=r,this.onServerInfoUpdate_=o,this.authTokenProvider_=l,this.appCheckTokenProvider_=c,this.authOverride_=d,this.id=Le.nextPersistentConnectionId_++,this.log_=Kt("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=Qt,this.maxReconnectDelay_=If,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,d)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");os.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&$n.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,i){const r=++this.requestNumber_,o={r,a:e,b:t};this.log_(Z(o)),A(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(o),i&&(this.requestCBHash_[r]=i)}get(e){this.initConnection_();const t=new Ti,r={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:l=>{const c=l.d;l.s==="ok"?t.resolve(c):t.reject(c)}};this.outstandingGets_.push(r),this.outstandingGetCount_++;const o=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(o),t.promise}listen(e,t,i,r){this.initConnection_();const o=e._queryIdentifier,l=e._path.toString();this.log_("Listen called for "+l+" "+o),this.listens.has(l)||this.listens.set(l,new Map),A(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),A(!this.listens.get(l).has(o),"listen() called twice for same path/queryId.");const c={onComplete:r,hashFn:t,query:e,tag:i};this.listens.get(l).set(o,c),this.connected_&&this.sendListen_(c)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,i=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(i)})}sendListen_(e){const t=e.query,i=t._path.toString(),r=t._queryIdentifier;this.log_("Listen on "+i+" for "+r);const o={p:i},l="q";e.tag&&(o.q=t._queryObject,o.t=e.tag),o.h=e.hashFn(),this.sendRequest(l,o,c=>{const d=c.d,f=c.s;Le.warnOnListenWarnings_(d,t),(this.listens.get(i)&&this.listens.get(i).get(r))===e&&(this.log_("listen response",c),f!=="ok"&&this.removeListen_(i,r),e.onComplete&&e.onComplete(f,d))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&ke(e,"w")){const i=ft(e,"w");if(Array.isArray(i)&&~i.indexOf("no_index")){const r='".indexOn": "'+t._queryParams.getIndex().toString()+'"',o=t._path.toString();ge(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${r} at ${o} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||Kh(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=Ta)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=Gh(e)?"auth":"gauth",i={cred:e};this.authOverride_===null?i.noauth=!0:typeof this.authOverride_=="object"&&(i.authvar=this.authOverride_),this.sendRequest(t,i,r=>{const o=r.s,l=r.d||"error";this.authToken_===e&&(o==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(o,l))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,i=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,i)})}unlisten(e,t){const i=e._path.toString(),r=e._queryIdentifier;this.log_("Unlisten called for "+i+" "+r),A(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(i,r)&&this.connected_&&this.sendUnlisten_(i,r,e._queryObject,t)}sendUnlisten_(e,t,i,r){this.log_("Unlisten on "+e+" for "+t);const o={p:e},l="n";r&&(o.q=i,o.t=r),this.sendRequest(l,o)}onDisconnectPut(e,t,i){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,i):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:i})}onDisconnectMerge(e,t,i){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,i):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:i})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,i,r){const o={p:t,d:i};this.log_("onDisconnect "+e,o),this.sendRequest(e,o,l=>{r&&setTimeout(()=>{r(l.s,l.d)},Math.floor(0))})}put(e,t,i,r){this.putInternal("p",e,t,i,r)}merge(e,t,i,r){this.putInternal("m",e,t,i,r)}putInternal(e,t,i,r,o){this.initConnection_();const l={p:t,d:i};o!==void 0&&(l.h=o),this.outstandingPuts_.push({action:e,request:l,onComplete:r}),this.outstandingPutCount_++;const c=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(c):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,i=this.outstandingPuts_[e].request,r=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,i,o=>{this.log_(t+" response",o),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),r&&r(o.s,o.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,i=>{if(i.s!=="ok"){const o=i.d;this.log_("reportStats","Error sending stats: "+o)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+Z(e));const t=e.r,i=this.requestCBHash_[t];i&&(delete this.requestCBHash_[t],i(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):Ji("Unrecognized action received from server: "+Z(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){A(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=Qt,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=Qt,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>Cf&&(this.reconnectDelay_=Qt),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*Tf)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),i=this.onRealtimeDisconnect_.bind(this),r=this.id+":"+Le.nextConnectionId_++,o=this.lastSessionId;let l=!1,c=null;const d=function(){c?c.close():(l=!0,i())},f=function(I){A(c,"sendRequest call when we're not connected not allowed."),c.sendRequest(I)};this.realtime_={close:d,sendRequest:f};const T=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[I,S]=await Promise.all([this.authTokenProvider_.getToken(T),this.appCheckTokenProvider_.getToken(T)]);l?te("getToken() completed but was canceled"):(te("getToken() completed. Creating connection."),this.authToken_=I&&I.accessToken,this.appCheckToken_=S&&S.token,c=new mf(r,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,i,N=>{ge(N+" ("+this.repoInfo_.toString()+")"),this.interrupt(Sf)},o))}catch(I){this.log_("Failed to get token: "+I),l||(this.repoInfo_.nodeAdmin&&ge(I),d())}}}interrupt(e){te("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){te("Resuming connection for reason: "+e),delete this.interruptReasons_[e],Tr(this.interruptReasons_)&&(this.reconnectDelay_=Qt,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let i;t?i=t.map(o=>Qi(o)).join("$"):i="default";const r=this.removeListen_(e,i);r&&r.onComplete&&r.onComplete("permission_denied")}removeListen_(e,t){const i=new W(e).toString();let r;if(this.listens.has(i)){const o=this.listens.get(i);r=o.get(t),o.delete(t),o.size===0&&this.listens.delete(i)}else r=void 0;return r}onAuthRevoked_(e,t){te("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=Ca&&(this.reconnectDelay_=Ta,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){te("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=Ca&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+Fo.replace(/\./g,"-")]=1,Ci()?e["framework.cordova"]=1:wr()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=$n.getInstance().currentlyOnline();return Tr(this.interruptReasons_)&&e}}Le.nextPersistentConnectionId_=0,Le.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new x(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gn{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const i=new x(yt,e),r=new x(yt,t);return this.compare(i,r)!==0}minPost(){return x.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Kn;class Sa extends Gn{static get __EMPTY_NODE(){return Kn}static set __EMPTY_NODE(e){Kn=e}compare(e,t){return vt(e.name,t.name)}isDefinedOn(e){throw dt("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return x.MIN}maxPost(){return new x(nt,Kn)}makePost(e,t){return A(typeof e=="string","KeyIndex indexValue must always be a string."),new x(e,Kn)}toString(){return".key"}}const wt=new Sa;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qn{constructor(e,t,i,r,o=null){this.isReverse_=r,this.resultGenerator_=o,this.nodeStack_=[];let l=1;for(;!e.isEmpty();)if(e=e,l=t?i(e.key,t):1,r&&(l*=-1),l<0)this.isReverse_?e=e.left:e=e.right;else if(l===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class X{constructor(e,t,i,r,o){this.key=e,this.value=t,this.color=i??X.RED,this.left=r??fe.EMPTY_NODE,this.right=o??fe.EMPTY_NODE}copy(e,t,i,r,o){return new X(e??this.key,t??this.value,i??this.color,r??this.left,o??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,i){let r=this;const o=i(e,r.key);return o<0?r=r.copy(null,null,null,r.left.insert(e,t,i),null):o===0?r=r.copy(null,t,null,null,null):r=r.copy(null,null,null,null,r.right.insert(e,t,i)),r.fixUp_()}removeMin_(){if(this.left.isEmpty())return fe.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let i,r;if(i=this,t(e,i.key)<0)!i.left.isEmpty()&&!i.left.isRed_()&&!i.left.left.isRed_()&&(i=i.moveRedLeft_()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed_()&&(i=i.rotateRight_()),!i.right.isEmpty()&&!i.right.isRed_()&&!i.right.left.isRed_()&&(i=i.moveRedRight_()),t(e,i.key)===0){if(i.right.isEmpty())return fe.EMPTY_NODE;r=i.right.min_(),i=i.copy(r.key,r.value,null,null,i.right.removeMin_())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,X.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,X.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}X.RED=!0,X.BLACK=!1;class bf{copy(e,t,i,r,o){return this}insert(e,t,i){return new X(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class fe{constructor(e,t=fe.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new fe(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,X.BLACK,null,null))}remove(e){return new fe(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,X.BLACK,null,null))}get(e){let t,i=this.root_;for(;!i.isEmpty();){if(t=this.comparator_(e,i.key),t===0)return i.value;t<0?i=i.left:t>0&&(i=i.right)}return null}getPredecessorKey(e){let t,i=this.root_,r=null;for(;!i.isEmpty();)if(t=this.comparator_(e,i.key),t===0){if(i.left.isEmpty())return r?r.key:null;for(i=i.left;!i.right.isEmpty();)i=i.right;return i.key}else t<0?i=i.left:t>0&&(r=i,i=i.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new qn(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new qn(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new qn(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new qn(this.root_,null,this.comparator_,!0,e)}}fe.EMPTY_NODE=new bf;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Af(n,e){return vt(n.name,e.name)}function as(n,e){return vt(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ls;function Rf(n){ls=n}const ba=function(n){return typeof n=="number"?"number:"+Vo(n):"string:"+n},Aa=function(n){if(n.isLeafNode()){const e=n.val();A(typeof e=="string"||typeof e=="number"||typeof e=="object"&&ke(e,".sv"),"Priority must be a string or number.")}else A(n===ls||n.isEmpty(),"priority of unexpected type.");A(n===ls||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ra;class J{static set __childrenNodeConstructor(e){Ra=e}static get __childrenNodeConstructor(){return Ra}constructor(e,t=J.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,A(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),Aa(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new J(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:J.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return O(e)?this:M(e)===".priority"?this.priorityNode_:J.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:J.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const i=M(e);return i===null?t:t.isEmpty()&&i!==".priority"?this:(A(i!==".priority"||$e(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(i,J.__childrenNodeConstructor.EMPTY_NODE.updateChild(V(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+ba(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=Vo(this.value_):e+=this.value_,this.lazyHash_=Bo(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===J.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof J.__childrenNodeConstructor?-1:(A(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,i=typeof this.value_,r=J.VALUE_TYPE_ORDER.indexOf(t),o=J.VALUE_TYPE_ORDER.indexOf(i);return A(r>=0,"Unknown leaf type: "+t),A(o>=0,"Unknown leaf type: "+i),r===o?i==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:o-r}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}J.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Na,ka;function Nf(n){Na=n}function kf(n){ka=n}class Pf extends Gn{compare(e,t){const i=e.node.getPriority(),r=t.node.getPriority(),o=i.compareTo(r);return o===0?vt(e.name,t.name):o}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return x.MIN}maxPost(){return new x(nt,new J("[PRIORITY-POST]",ka))}makePost(e,t){const i=Na(e);return new x(t,new J("[PRIORITY-POST]",i))}toString(){return".priority"}}const ne=new Pf;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Of=Math.log(2);class Df{constructor(e){const t=o=>parseInt(Math.log(o)/Of,10),i=o=>parseInt(Array(o+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const r=i(this.count);this.bits_=e+1&r}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Yn=function(n,e,t,i){n.sort(e);const r=function(d,f){const T=f-d;let I,S;if(T===0)return null;if(T===1)return I=n[d],S=t?t(I):I,new X(S,I.node,X.BLACK,null,null);{const N=parseInt(T/2,10)+d,R=r(d,N),P=r(N+1,f);return I=n[N],S=t?t(I):I,new X(S,I.node,X.BLACK,R,P)}},o=function(d){let f=null,T=null,I=n.length;const S=function(R,P){const k=I-R,_e=I;I-=R;const Q=r(k+1,_e),q=n[k],me=t?t(q):q;N(new X(me,q.node,P,null,Q))},N=function(R){f?(f.left=R,f=R):(T=R,f=R)};for(let R=0;R<d.count;++R){const P=d.nextBitIsOne(),k=Math.pow(2,d.count-(R+1));P?S(k,X.BLACK):(S(k,X.BLACK),S(k,X.RED))}return T},l=new Df(n.length),c=o(l);return new fe(i||e,c)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let hs;const It={};class Me{static get Default(){return A(It&&ne,"ChildrenNode.ts has not been loaded"),hs=hs||new Me({".priority":It},{".priority":ne}),hs}constructor(e,t){this.indexes_=e,this.indexSet_=t}get(e){const t=ft(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof fe?t:null}hasIndex(e){return ke(this.indexSet_,e.toString())}addIndex(e,t){A(e!==wt,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const i=[];let r=!1;const o=t.getIterator(x.Wrap);let l=o.getNext();for(;l;)r=r||e.isDefinedOn(l.node),i.push(l),l=o.getNext();let c;r?c=Yn(i,e.getCompare()):c=It;const d=e.toString(),f=Object.assign({},this.indexSet_);f[d]=e;const T=Object.assign({},this.indexes_);return T[d]=c,new Me(T,f)}addToIndexes(e,t){const i=bn(this.indexes_,(r,o)=>{const l=ft(this.indexSet_,o);if(A(l,"Missing index implementation for "+o),r===It)if(l.isDefinedOn(e.node)){const c=[],d=t.getIterator(x.Wrap);let f=d.getNext();for(;f;)f.name!==e.name&&c.push(f),f=d.getNext();return c.push(e),Yn(c,l.getCompare())}else return It;else{const c=t.get(e.name);let d=r;return c&&(d=d.remove(new x(e.name,c))),d.insert(e,e.node)}});return new Me(i,this.indexSet_)}removeFromIndexes(e,t){const i=bn(this.indexes_,r=>{if(r===It)return r;{const o=t.get(e.name);return o?r.remove(new x(e.name,o)):r}});return new Me(i,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Zt;class B{static get EMPTY_NODE(){return Zt||(Zt=new B(new fe(as),null,Me.Default))}constructor(e,t,i){this.children_=e,this.priorityNode_=t,this.indexMap_=i,this.lazyHash_=null,this.priorityNode_&&Aa(this.priorityNode_),this.children_.isEmpty()&&A(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Zt}updatePriority(e){return this.children_.isEmpty()?this:new B(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Zt:t}}getChild(e){const t=M(e);return t===null?this:this.getImmediateChild(t).getChild(V(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(A(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const i=new x(e,t);let r,o;t.isEmpty()?(r=this.children_.remove(e),o=this.indexMap_.removeFromIndexes(i,this.children_)):(r=this.children_.insert(e,t),o=this.indexMap_.addToIndexes(i,this.children_));const l=r.isEmpty()?Zt:this.priorityNode_;return new B(r,l,o)}}updateChild(e,t){const i=M(e);if(i===null)return t;{A(M(e)!==".priority"||$e(e)===1,".priority must be the last token in a path");const r=this.getImmediateChild(i).updateChild(V(e),t);return this.updateImmediateChild(i,r)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let i=0,r=0,o=!0;if(this.forEachChild(ne,(l,c)=>{t[l]=c.val(e),i++,o&&B.INTEGER_REGEXP_.test(l)?r=Math.max(r,Number(l)):o=!1}),!e&&o&&r<2*i){const l=[];for(const c in t)l[c]=t[c];return l}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+ba(this.getPriority().val())+":"),this.forEachChild(ne,(t,i)=>{const r=i.hash();r!==""&&(e+=":"+t+":"+r)}),this.lazyHash_=e===""?"":Bo(e)}return this.lazyHash_}getPredecessorChildName(e,t,i){const r=this.resolveIndex_(i);if(r){const o=r.getPredecessorKey(new x(e,t));return o?o.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const i=t.minKey();return i&&i.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new x(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const i=t.maxKey();return i&&i.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new x(t,this.children_.get(t)):null}forEachChild(e,t){const i=this.resolveIndex_(e);return i?i.inorderTraversal(r=>t(r.name,r.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const i=this.resolveIndex_(t);if(i)return i.getIteratorFrom(e,r=>r);{const r=this.children_.getIteratorFrom(e.name,x.Wrap);let o=r.peek();for(;o!=null&&t.compare(o,e)<0;)r.getNext(),o=r.peek();return r}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const i=this.resolveIndex_(t);if(i)return i.getReverseIteratorFrom(e,r=>r);{const r=this.children_.getReverseIteratorFrom(e.name,x.Wrap);let o=r.peek();for(;o!=null&&t.compare(o,e)>0;)r.getNext(),o=r.peek();return r}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===en?-1:0}withIndex(e){if(e===wt||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new B(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===wt||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const i=this.getIterator(ne),r=t.getIterator(ne);let o=i.getNext(),l=r.getNext();for(;o&&l;){if(o.name!==l.name||!o.node.equals(l.node))return!1;o=i.getNext(),l=r.getNext()}return o===null&&l===null}else return!1;else return!1}}resolveIndex_(e){return e===wt?null:this.indexMap_.get(e.toString())}}B.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class Lf extends B{constructor(){super(new fe(as),B.EMPTY_NODE,Me.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return B.EMPTY_NODE}isEmpty(){return!1}}const en=new Lf;Object.defineProperties(x,{MIN:{value:new x(yt,B.EMPTY_NODE)},MAX:{value:new x(nt,en)}}),Sa.__EMPTY_NODE=B.EMPTY_NODE,J.__childrenNodeConstructor=B,Rf(en),kf(en);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mf=!0;function ie(n,e=null){if(n===null)return B.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),A(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new J(t,ie(e))}if(!(n instanceof Array)&&Mf){const t=[];let i=!1;if(ye(n,(l,c)=>{if(l.substring(0,1)!=="."){const d=ie(c);d.isEmpty()||(i=i||!d.getPriority().isEmpty(),t.push(new x(l,d)))}}),t.length===0)return B.EMPTY_NODE;const o=Yn(t,Af,l=>l.name,as);if(i){const l=Yn(t,ne.getCompare());return new B(o,ie(e),new Me({".priority":l},{".priority":ne}))}else return new B(o,ie(e),Me.Default)}else{let t=B.EMPTY_NODE;return ye(n,(i,r)=>{if(ke(n,i)&&i.substring(0,1)!=="."){const o=ie(r);(o.isLeafNode()||!o.isEmpty())&&(t=t.updateImmediateChild(i,o))}}),t.updatePriority(ie(e))}}Nf(ie);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xf extends Gn{constructor(e){super(),this.indexPath_=e,A(!O(e)&&M(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const i=this.extractChild(e.node),r=this.extractChild(t.node),o=i.compareTo(r);return o===0?vt(e.name,t.name):o}makePost(e,t){const i=ie(e),r=B.EMPTY_NODE.updateChild(this.indexPath_,i);return new x(t,r)}maxPost(){const e=B.EMPTY_NODE.updateChild(this.indexPath_,en);return new x(nt,e)}toString(){return va(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ff extends Gn{compare(e,t){const i=e.node.compareTo(t.node);return i===0?vt(e.name,t.name):i}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return x.MIN}maxPost(){return x.MAX}makePost(e,t){const i=ie(e);return new x(t,i)}toString(){return".value"}}const Uf=new Ff;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bf(n){return{type:"value",snapshotNode:n}}function Hf(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function jf(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function Pa(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function Wf(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cs{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=ne}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return A(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return A(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:yt}hasEnd(){return this.endSet_}getIndexEndValue(){return A(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return A(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:nt}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return A(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===ne}copy(){const e=new cs;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function Oa(n){const e={};if(n.isDefault())return e;let t;if(n.index_===ne?t="$priority":n.index_===Uf?t="$value":n.index_===wt?t="$key":(A(n.index_ instanceof xf,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=Z(t),n.startSet_){const i=n.startAfterSet_?"startAfter":"startAt";e[i]=Z(n.indexStartValue_),n.startNameSet_&&(e[i]+=","+Z(n.indexStartName_))}if(n.endSet_){const i=n.endBeforeSet_?"endBefore":"endAt";e[i]=Z(n.indexEndValue_),n.endNameSet_&&(e[i]+=","+Z(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function Da(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==ne&&(e.i=n.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn extends pa{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(A(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,t,i,r){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=i,this.appCheckTokenProvider_=r,this.log_=Kt("p:rest:"),this.listens_={}}listen(e,t,i,r){const o=e._path.toString();this.log_("Listen called for "+o+" "+e._queryIdentifier);const l=Xn.getListenId_(e,i),c={};this.listens_[l]=c;const d=Oa(e._queryParams);this.restRequest_(o+".json",d,(f,T)=>{let I=T;if(f===404&&(I=null,f=null),f===null&&this.onDataUpdate_(o,I,!1,i),ft(this.listens_,l)===c){let S;f?f===401?S="permission_denied":S="rest_error:"+f:S="ok",r(S,null)}})}unlisten(e,t){const i=Xn.getListenId_(e,t);delete this.listens_[i]}get(e){const t=Oa(e._queryParams),i=e._path.toString(),r=new Ti;return this.restRequest_(i+".json",t,(o,l)=>{let c=l;o===404&&(c=null,o=null),o===null?(this.onDataUpdate_(i,c,!1,null),r.resolve(c)):r.reject(new Error(c))}),r.promise}refreshAuthToken(e){}restRequest_(e,t={},i){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([r,o])=>{r&&r.accessToken&&(t.auth=r.accessToken),o&&o.token&&(t.ac=o.token);const l=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+Si(t);this.log_("Sending REST request for "+l);const c=new XMLHttpRequest;c.onreadystatechange=()=>{if(i&&c.readyState===4){this.log_("REST Response for "+l+" received. status:",c.status,"response:",c.responseText);let d=null;if(c.status>=200&&c.status<300){try{d=Dt(c.responseText)}catch{ge("Failed to parse JSON response for "+l+": "+c.responseText)}i(null,d)}else c.status!==401&&c.status!==404&&ge("Got unsuccessful REST response for "+l+" Status: "+c.status),i(c.status);i=null}},c.open("GET",l,!0),c.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vf{constructor(){this.rootNode_=B.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jn(){return{value:null,children:new Map}}function La(n,e,t){if(O(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const i=M(e);n.children.has(i)||n.children.set(i,Jn());const r=n.children.get(i);e=V(e),La(r,e,t)}}function us(n,e,t){n.value!==null?t(e,n.value):zf(n,(i,r)=>{const o=new W(e.toString()+"/"+i);us(r,o,t)})}function zf(n,e){n.children.forEach((t,i)=>{e(i,t)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $f{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t=Object.assign({},e);return this.last_&&ye(this.last_,(i,r)=>{t[i]=t[i]-r}),this.last_=e,t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ma=10*1e3,Gf=30*1e3,Kf=5*60*1e3;class qf{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new $f(e);const i=Ma+(Gf-Ma)*Math.random();Xt(this.reportStats_.bind(this),Math.floor(i))}reportStats_(){const e=this.statsListener_.get(),t={};let i=!1;ye(e,(r,o)=>{o>0&&ke(this.statsToReport_,r)&&(t[r]=o,i=!0)}),i&&this.server_.reportStats(t),Xt(this.reportStats_.bind(this),Math.floor(Math.random()*2*Kf))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ne;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(Ne||(Ne={}));function xa(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function Fa(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function Ua(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qn{constructor(e,t,i){this.path=e,this.affectedTree=t,this.revert=i,this.type=Ne.ACK_USER_WRITE,this.source=xa()}operationForChild(e){if(O(this.path)){if(this.affectedTree.value!=null)return A(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new W(e));return new Qn(H(),t,this.revert)}}else return A(M(this.path)===e,"operationForChild called for unrelated child."),new Qn(V(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(e,t,i){this.source=e,this.path=t,this.snap=i,this.type=Ne.OVERWRITE}operationForChild(e){return O(this.path)?new st(this.source,H(),this.snap.getImmediateChild(e)):new st(this.source,V(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tn{constructor(e,t,i){this.source=e,this.path=t,this.children=i,this.type=Ne.MERGE}operationForChild(e){if(O(this.path)){const t=this.children.subtree(new W(e));return t.isEmpty()?null:t.value?new st(this.source,H(),t.value):new tn(this.source,H(),t)}else return A(M(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new tn(this.source,V(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(e,t,i){this.node_=e,this.fullyInitialized_=t,this.filtered_=i}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(O(e))return this.isFullyInitialized()&&!this.filtered_;const t=M(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}function Yf(n,e,t,i){const r=[],o=[];return e.forEach(l=>{l.type==="child_changed"&&n.index_.indexedValueChanged(l.oldSnap,l.snapshotNode)&&o.push(Wf(l.childName,l.snapshotNode))}),nn(n,r,"child_removed",e,i,t),nn(n,r,"child_added",e,i,t),nn(n,r,"child_moved",o,i,t),nn(n,r,"child_changed",e,i,t),nn(n,r,"value",e,i,t),r}function nn(n,e,t,i,r,o){const l=i.filter(c=>c.type===t);l.sort((c,d)=>Jf(n,c,d)),l.forEach(c=>{const d=Xf(n,c,o);r.forEach(f=>{f.respondsTo(c.type)&&e.push(f.createEvent(d,n.query_))})})}function Xf(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function Jf(n,e,t){if(e.childName==null||t.childName==null)throw dt("Should only compare child_ events.");const i=new x(e.childName,e.snapshotNode),r=new x(t.childName,t.snapshotNode);return n.index_.compare(i,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ba(n,e){return{eventCache:n,serverCache:e}}function sn(n,e,t,i){return Ba(new ds(e,t,i),n.serverCache)}function Ha(n,e,t,i){return Ba(n.eventCache,new ds(e,t,i))}function fs(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function rt(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ps;const Qf=()=>(ps||(ps=new fe(Fd)),ps);class z{static fromObject(e){let t=new z(null);return ye(e,(i,r)=>{t=t.set(new W(i),r)}),t}constructor(e,t=Qf()){this.value=e,this.children=t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:H(),value:this.value};if(O(e))return null;{const i=M(e),r=this.children.get(i);if(r!==null){const o=r.findRootMostMatchingPathAndValue(V(e),t);return o!=null?{path:Y(new W(i),o.path),value:o.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(O(e))return this;{const t=M(e),i=this.children.get(t);return i!==null?i.subtree(V(e)):new z(null)}}set(e,t){if(O(e))return new z(t,this.children);{const i=M(e),o=(this.children.get(i)||new z(null)).set(V(e),t),l=this.children.insert(i,o);return new z(this.value,l)}}remove(e){if(O(e))return this.children.isEmpty()?new z(null):new z(null,this.children);{const t=M(e),i=this.children.get(t);if(i){const r=i.remove(V(e));let o;return r.isEmpty()?o=this.children.remove(t):o=this.children.insert(t,r),this.value===null&&o.isEmpty()?new z(null):new z(this.value,o)}else return this}}get(e){if(O(e))return this.value;{const t=M(e),i=this.children.get(t);return i?i.get(V(e)):null}}setTree(e,t){if(O(e))return t;{const i=M(e),o=(this.children.get(i)||new z(null)).setTree(V(e),t);let l;return o.isEmpty()?l=this.children.remove(i):l=this.children.insert(i,o),new z(this.value,l)}}fold(e){return this.fold_(H(),e)}fold_(e,t){const i={};return this.children.inorderTraversal((r,o)=>{i[r]=o.fold_(Y(e,r),t)}),t(e,this.value,i)}findOnPath(e,t){return this.findOnPath_(e,H(),t)}findOnPath_(e,t,i){const r=this.value?i(t,this.value):!1;if(r)return r;if(O(e))return null;{const o=M(e),l=this.children.get(o);return l?l.findOnPath_(V(e),Y(t,o),i):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,H(),t)}foreachOnPath_(e,t,i){if(O(e))return this;{this.value&&i(t,this.value);const r=M(e),o=this.children.get(r);return o?o.foreachOnPath_(V(e),Y(t,r),i):new z(null)}}foreach(e){this.foreach_(H(),e)}foreach_(e,t){this.children.inorderTraversal((i,r)=>{r.foreach_(Y(e,i),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,i)=>{i.value&&e(t,i.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Se{constructor(e){this.writeTree_=e}static empty(){return new Se(new z(null))}}function rn(n,e,t){if(O(e))return new Se(new z(t));{const i=n.writeTree_.findRootMostValueAndPath(e);if(i!=null){const r=i.path;let o=i.value;const l=ve(r,e);return o=o.updateChild(l,t),new Se(n.writeTree_.set(r,o))}else{const r=new z(t),o=n.writeTree_.setTree(e,r);return new Se(o)}}}function ja(n,e,t){let i=n;return ye(t,(r,o)=>{i=rn(i,Y(e,r),o)}),i}function Wa(n,e){if(O(e))return Se.empty();{const t=n.writeTree_.setTree(e,new z(null));return new Se(t)}}function gs(n,e){return ot(n,e)!=null}function ot(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(ve(t.path,e)):null}function Va(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(ne,(i,r)=>{e.push(new x(i,r))}):n.writeTree_.children.inorderTraversal((i,r)=>{r.value!=null&&e.push(new x(i,r.value))}),e}function Ge(n,e){if(O(e))return n;{const t=ot(n,e);return t!=null?new Se(new z(t)):new Se(n.writeTree_.subtree(e))}}function _s(n){return n.writeTree_.isEmpty()}function Tt(n,e){return za(H(),n.writeTree_,e)}function za(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let i=null;return e.children.inorderTraversal((r,o)=>{r===".priority"?(A(o.value!==null,"Priority writes must always be leaf nodes"),i=o.value):t=za(Y(n,r),o,t)}),!t.getChild(n).isEmpty()&&i!==null&&(t=t.updateChild(Y(n,".priority"),i)),t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $a(n,e){return Ja(e,n)}function Zf(n,e,t,i,r){A(i>n.lastWriteId,"Stacking an older write on top of newer ones"),r===void 0&&(r=!0),n.allWrites.push({path:e,snap:t,writeId:i,visible:r}),r&&(n.visibleWrites=rn(n.visibleWrites,e,t)),n.lastWriteId=i}function ep(n,e){for(let t=0;t<n.allWrites.length;t++){const i=n.allWrites[t];if(i.writeId===e)return i}return null}function tp(n,e){const t=n.allWrites.findIndex(c=>c.writeId===e);A(t>=0,"removeWrite called with nonexistent writeId.");const i=n.allWrites[t];n.allWrites.splice(t,1);let r=i.visible,o=!1,l=n.allWrites.length-1;for(;r&&l>=0;){const c=n.allWrites[l];c.visible&&(l>=t&&np(c,i.path)?r=!1:Ce(i.path,c.path)&&(o=!0)),l--}if(r){if(o)return ip(n),!0;if(i.snap)n.visibleWrites=Wa(n.visibleWrites,i.path);else{const c=i.children;ye(c,d=>{n.visibleWrites=Wa(n.visibleWrites,Y(i.path,d))})}return!0}else return!1}function np(n,e){if(n.snap)return Ce(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&Ce(Y(n.path,t),e))return!0;return!1}function ip(n){n.visibleWrites=Ga(n.allWrites,sp,H()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function sp(n){return n.visible}function Ga(n,e,t){let i=Se.empty();for(let r=0;r<n.length;++r){const o=n[r];if(e(o)){const l=o.path;let c;if(o.snap)Ce(t,l)?(c=ve(t,l),i=rn(i,c,o.snap)):Ce(l,t)&&(c=ve(l,t),i=rn(i,H(),o.snap.getChild(c)));else if(o.children){if(Ce(t,l))c=ve(t,l),i=ja(i,c,o.children);else if(Ce(l,t))if(c=ve(l,t),O(c))i=ja(i,H(),o.children);else{const d=ft(o.children,M(c));if(d){const f=d.getChild(V(c));i=rn(i,H(),f)}}}else throw dt("WriteRecord should have .snap or .children")}}return i}function Ka(n,e,t,i,r){if(!i&&!r){const o=ot(n.visibleWrites,e);if(o!=null)return o;{const l=Ge(n.visibleWrites,e);if(_s(l))return t;if(t==null&&!gs(l,H()))return null;{const c=t||B.EMPTY_NODE;return Tt(l,c)}}}else{const o=Ge(n.visibleWrites,e);if(!r&&_s(o))return t;if(!r&&t==null&&!gs(o,H()))return null;{const l=function(f){return(f.visible||r)&&(!i||!~i.indexOf(f.writeId))&&(Ce(f.path,e)||Ce(e,f.path))},c=Ga(n.allWrites,l,e),d=t||B.EMPTY_NODE;return Tt(c,d)}}}function rp(n,e,t){let i=B.EMPTY_NODE;const r=ot(n.visibleWrites,e);if(r)return r.isLeafNode()||r.forEachChild(ne,(o,l)=>{i=i.updateImmediateChild(o,l)}),i;if(t){const o=Ge(n.visibleWrites,e);return t.forEachChild(ne,(l,c)=>{const d=Tt(Ge(o,new W(l)),c);i=i.updateImmediateChild(l,d)}),Va(o).forEach(l=>{i=i.updateImmediateChild(l.name,l.node)}),i}else{const o=Ge(n.visibleWrites,e);return Va(o).forEach(l=>{i=i.updateImmediateChild(l.name,l.node)}),i}}function op(n,e,t,i,r){A(i||r,"Either existingEventSnap or existingServerSnap must exist");const o=Y(e,t);if(gs(n.visibleWrites,o))return null;{const l=Ge(n.visibleWrites,o);return _s(l)?r.getChild(t):Tt(l,r.getChild(t))}}function ap(n,e,t,i){const r=Y(e,t),o=ot(n.visibleWrites,r);if(o!=null)return o;if(i.isCompleteForChild(t)){const l=Ge(n.visibleWrites,r);return Tt(l,i.getNode().getImmediateChild(t))}else return null}function lp(n,e){return ot(n.visibleWrites,e)}function hp(n,e,t,i,r,o,l){let c;const d=Ge(n.visibleWrites,e),f=ot(d,H());if(f!=null)c=f;else if(t!=null)c=Tt(d,t);else return[];if(c=c.withIndex(l),!c.isEmpty()&&!c.isLeafNode()){const T=[],I=l.getCompare(),S=o?c.getReverseIteratorFrom(i,l):c.getIteratorFrom(i,l);let N=S.getNext();for(;N&&T.length<r;)I(N,i)!==0&&T.push(N),N=S.getNext();return T}else return[]}function cp(){return{visibleWrites:Se.empty(),allWrites:[],lastWriteId:-1}}function ms(n,e,t,i){return Ka(n.writeTree,n.treePath,e,t,i)}function qa(n,e){return rp(n.writeTree,n.treePath,e)}function Ya(n,e,t,i){return op(n.writeTree,n.treePath,e,t,i)}function Zn(n,e){return lp(n.writeTree,Y(n.treePath,e))}function up(n,e,t,i,r,o){return hp(n.writeTree,n.treePath,e,t,i,r,o)}function ys(n,e,t){return ap(n.writeTree,n.treePath,e,t)}function Xa(n,e){return Ja(Y(n.treePath,e),n.writeTree)}function Ja(n,e){return{treePath:n,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dp{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,i=e.childName;A(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),A(i!==".priority","Only non-priority child changes can be tracked.");const r=this.changeMap.get(i);if(r){const o=r.type;if(t==="child_added"&&o==="child_removed")this.changeMap.set(i,Pa(i,e.snapshotNode,r.snapshotNode));else if(t==="child_removed"&&o==="child_added")this.changeMap.delete(i);else if(t==="child_removed"&&o==="child_changed")this.changeMap.set(i,jf(i,r.oldSnap));else if(t==="child_changed"&&o==="child_added")this.changeMap.set(i,Hf(i,e.snapshotNode));else if(t==="child_changed"&&o==="child_changed")this.changeMap.set(i,Pa(i,e.snapshotNode,r.oldSnap));else throw dt("Illegal combination of changes: "+e+" occurred after "+r)}else this.changeMap.set(i,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fp{getCompleteChild(e){return null}getChildAfterChild(e,t,i){return null}}const Qa=new fp;class vs{constructor(e,t,i=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=i}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const i=this.optCompleteServerCache_!=null?new ds(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return ys(this.writes_,e,i)}}getChildAfterChild(e,t,i){const r=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:rt(this.viewCache_),o=up(this.writes_,r,t,1,i,e);return o.length===0?null:o[0]}}function pp(n,e){A(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),A(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function gp(n,e,t,i,r){const o=new dp;let l,c;if(t.type===Ne.OVERWRITE){const f=t;f.source.fromUser?l=Es(n,e,f.path,f.snap,i,r,o):(A(f.source.fromServer,"Unknown source."),c=f.source.tagged||e.serverCache.isFiltered()&&!O(f.path),l=ei(n,e,f.path,f.snap,i,r,c,o))}else if(t.type===Ne.MERGE){const f=t;f.source.fromUser?l=mp(n,e,f.path,f.children,i,r,o):(A(f.source.fromServer,"Unknown source."),c=f.source.tagged||e.serverCache.isFiltered(),l=ws(n,e,f.path,f.children,i,r,c,o))}else if(t.type===Ne.ACK_USER_WRITE){const f=t;f.revert?l=Ep(n,e,f.path,i,r,o):l=yp(n,e,f.path,f.affectedTree,i,r,o)}else if(t.type===Ne.LISTEN_COMPLETE)l=vp(n,e,t.path,i,o);else throw dt("Unknown operation type: "+t.type);const d=o.getChanges();return _p(e,l,d),{viewCache:l,changes:d}}function _p(n,e,t){const i=e.eventCache;if(i.isFullyInitialized()){const r=i.getNode().isLeafNode()||i.getNode().isEmpty(),o=fs(n);(t.length>0||!n.eventCache.isFullyInitialized()||r&&!i.getNode().equals(o)||!i.getNode().getPriority().equals(o.getPriority()))&&t.push(Bf(fs(e)))}}function Za(n,e,t,i,r,o){const l=e.eventCache;if(Zn(i,t)!=null)return e;{let c,d;if(O(t))if(A(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const f=rt(e),T=f instanceof B?f:B.EMPTY_NODE,I=qa(i,T);c=n.filter.updateFullNode(e.eventCache.getNode(),I,o)}else{const f=ms(i,rt(e));c=n.filter.updateFullNode(e.eventCache.getNode(),f,o)}else{const f=M(t);if(f===".priority"){A($e(t)===1,"Can't have a priority with additional path components");const T=l.getNode();d=e.serverCache.getNode();const I=Ya(i,t,T,d);I!=null?c=n.filter.updatePriority(T,I):c=l.getNode()}else{const T=V(t);let I;if(l.isCompleteForChild(f)){d=e.serverCache.getNode();const S=Ya(i,t,l.getNode(),d);S!=null?I=l.getNode().getImmediateChild(f).updateChild(T,S):I=l.getNode().getImmediateChild(f)}else I=ys(i,f,e.serverCache);I!=null?c=n.filter.updateChild(l.getNode(),f,I,T,r,o):c=l.getNode()}}return sn(e,c,l.isFullyInitialized()||O(t),n.filter.filtersNodes())}}function ei(n,e,t,i,r,o,l,c){const d=e.serverCache;let f;const T=l?n.filter:n.filter.getIndexedFilter();if(O(t))f=T.updateFullNode(d.getNode(),i,null);else if(T.filtersNodes()&&!d.isFiltered()){const N=d.getNode().updateChild(t,i);f=T.updateFullNode(d.getNode(),N,null)}else{const N=M(t);if(!d.isCompleteForPath(t)&&$e(t)>1)return e;const R=V(t),k=d.getNode().getImmediateChild(N).updateChild(R,i);N===".priority"?f=T.updatePriority(d.getNode(),k):f=T.updateChild(d.getNode(),N,k,R,Qa,null)}const I=Ha(e,f,d.isFullyInitialized()||O(t),T.filtersNodes()),S=new vs(r,I,o);return Za(n,I,t,r,S,c)}function Es(n,e,t,i,r,o,l){const c=e.eventCache;let d,f;const T=new vs(r,e,o);if(O(t))f=n.filter.updateFullNode(e.eventCache.getNode(),i,l),d=sn(e,f,!0,n.filter.filtersNodes());else{const I=M(t);if(I===".priority")f=n.filter.updatePriority(e.eventCache.getNode(),i),d=sn(e,f,c.isFullyInitialized(),c.isFiltered());else{const S=V(t),N=c.getNode().getImmediateChild(I);let R;if(O(S))R=i;else{const P=T.getCompleteChild(I);P!=null?ya(S)===".priority"&&P.getChild(Ea(S)).isEmpty()?R=P:R=P.updateChild(S,i):R=B.EMPTY_NODE}if(N.equals(R))d=e;else{const P=n.filter.updateChild(c.getNode(),I,R,S,T,l);d=sn(e,P,c.isFullyInitialized(),n.filter.filtersNodes())}}}return d}function el(n,e){return n.eventCache.isCompleteForChild(e)}function mp(n,e,t,i,r,o,l){let c=e;return i.foreach((d,f)=>{const T=Y(t,d);el(e,M(T))&&(c=Es(n,c,T,f,r,o,l))}),i.foreach((d,f)=>{const T=Y(t,d);el(e,M(T))||(c=Es(n,c,T,f,r,o,l))}),c}function tl(n,e,t){return t.foreach((i,r)=>{e=e.updateChild(i,r)}),e}function ws(n,e,t,i,r,o,l,c){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let d=e,f;O(t)?f=i:f=new z(null).setTree(t,i);const T=e.serverCache.getNode();return f.children.inorderTraversal((I,S)=>{if(T.hasChild(I)){const N=e.serverCache.getNode().getImmediateChild(I),R=tl(n,N,S);d=ei(n,d,new W(I),R,r,o,l,c)}}),f.children.inorderTraversal((I,S)=>{const N=!e.serverCache.isCompleteForChild(I)&&S.value===null;if(!T.hasChild(I)&&!N){const R=e.serverCache.getNode().getImmediateChild(I),P=tl(n,R,S);d=ei(n,d,new W(I),P,r,o,l,c)}}),d}function yp(n,e,t,i,r,o,l){if(Zn(r,t)!=null)return e;const c=e.serverCache.isFiltered(),d=e.serverCache;if(i.value!=null){if(O(t)&&d.isFullyInitialized()||d.isCompleteForPath(t))return ei(n,e,t,d.getNode().getChild(t),r,o,c,l);if(O(t)){let f=new z(null);return d.getNode().forEachChild(wt,(T,I)=>{f=f.set(new W(T),I)}),ws(n,e,t,f,r,o,c,l)}else return e}else{let f=new z(null);return i.foreach((T,I)=>{const S=Y(t,T);d.isCompleteForPath(S)&&(f=f.set(T,d.getNode().getChild(S)))}),ws(n,e,t,f,r,o,c,l)}}function vp(n,e,t,i,r){const o=e.serverCache,l=Ha(e,o.getNode(),o.isFullyInitialized()||O(t),o.isFiltered());return Za(n,l,t,i,Qa,r)}function Ep(n,e,t,i,r,o){let l;if(Zn(i,t)!=null)return e;{const c=new vs(i,e,r),d=e.eventCache.getNode();let f;if(O(t)||M(t)===".priority"){let T;if(e.serverCache.isFullyInitialized())T=ms(i,rt(e));else{const I=e.serverCache.getNode();A(I instanceof B,"serverChildren would be complete if leaf node"),T=qa(i,I)}T=T,f=n.filter.updateFullNode(d,T,o)}else{const T=M(t);let I=ys(i,T,e.serverCache);I==null&&e.serverCache.isCompleteForChild(T)&&(I=d.getImmediateChild(T)),I!=null?f=n.filter.updateChild(d,T,I,V(t),c,o):e.eventCache.getNode().hasChild(T)?f=n.filter.updateChild(d,T,B.EMPTY_NODE,V(t),c,o):f=d,f.isEmpty()&&e.serverCache.isFullyInitialized()&&(l=ms(i,rt(e)),l.isLeafNode()&&(f=n.filter.updateFullNode(f,l,o)))}return l=e.serverCache.isFullyInitialized()||Zn(i,H())!=null,sn(e,f,l,n.filter.filtersNodes())}}function wp(n,e){const t=rt(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!O(e)&&!t.getImmediateChild(M(e)).isEmpty())?t.getChild(e):null}function nl(n,e,t,i){e.type===Ne.MERGE&&e.source.queryId!==null&&(A(rt(n.viewCache_),"We should always have a full cache before handling merges"),A(fs(n.viewCache_),"Missing event cache, even though we have a server cache"));const r=n.viewCache_,o=gp(n.processor_,r,e,t,i);return pp(n.processor_,o.viewCache),A(o.viewCache.serverCache.isFullyInitialized()||!r.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=o.viewCache,Ip(n,o.changes,o.viewCache.eventCache.getNode())}function Ip(n,e,t,i){const r=n.eventRegistrations_;return Yf(n.eventGenerator_,e,t,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let il;function Tp(n){A(!il,"__referenceConstructor has already been defined"),il=n}function Is(n,e,t,i){const r=e.source.queryId;if(r!==null){const o=n.views.get(r);return A(o!=null,"SyncTree gave us an op for an invalid query."),nl(o,e,t,i)}else{let o=[];for(const l of n.views.values())o=o.concat(nl(l,e,t,i));return o}}function Ts(n,e){let t=null;for(const i of n.views.values())t=t||wp(i,e);return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let sl;function Cp(n){A(!sl,"__referenceConstructor has already been defined"),sl=n}class rl{constructor(e){this.listenProvider_=e,this.syncPointTree_=new z(null),this.pendingWriteTree_=cp(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function Sp(n,e,t,i,r){return Zf(n.pendingWriteTree_,e,t,i,r),r?ni(n,new st(xa(),e,t)):[]}function Ct(n,e,t=!1){const i=ep(n.pendingWriteTree_,e);if(tp(n.pendingWriteTree_,e)){let o=new z(null);return i.snap!=null?o=o.set(H(),!0):ye(i.children,l=>{o=o.set(new W(l),!0)}),ni(n,new Qn(i.path,o,t))}else return[]}function ti(n,e,t){return ni(n,new st(Fa(),e,t))}function bp(n,e,t){const i=z.fromObject(t);return ni(n,new tn(Fa(),e,i))}function Ap(n,e,t,i){const r=hl(n,i);if(r!=null){const o=cl(r),l=o.path,c=o.queryId,d=ve(l,e),f=new st(Ua(c),d,t);return ul(n,l,f)}else return[]}function Rp(n,e,t,i){const r=hl(n,i);if(r){const o=cl(r),l=o.path,c=o.queryId,d=ve(l,e),f=z.fromObject(t),T=new tn(Ua(c),d,f);return ul(n,l,T)}else return[]}function ol(n,e,t){const r=n.pendingWriteTree_,o=n.syncPointTree_.findOnPath(e,(l,c)=>{const d=ve(l,e),f=Ts(c,d);if(f)return f});return Ka(r,e,o,t,!0)}function ni(n,e){return al(e,n.syncPointTree_,null,$a(n.pendingWriteTree_,H()))}function al(n,e,t,i){if(O(n.path))return ll(n,e,t,i);{const r=e.get(H());t==null&&r!=null&&(t=Ts(r,H()));let o=[];const l=M(n.path),c=n.operationForChild(l),d=e.children.get(l);if(d&&c){const f=t?t.getImmediateChild(l):null,T=Xa(i,l);o=o.concat(al(c,d,f,T))}return r&&(o=o.concat(Is(r,n,i,t))),o}}function ll(n,e,t,i){const r=e.get(H());t==null&&r!=null&&(t=Ts(r,H()));let o=[];return e.children.inorderTraversal((l,c)=>{const d=t?t.getImmediateChild(l):null,f=Xa(i,l),T=n.operationForChild(l);T&&(o=o.concat(ll(T,c,d,f)))}),r&&(o=o.concat(Is(r,n,i,t))),o}function hl(n,e){return n.tagToQueryMap.get(e)}function cl(n){const e=n.indexOf("$");return A(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new W(n.substr(0,e))}}function ul(n,e,t){const i=n.syncPointTree_.get(e);A(i,"Missing sync point for query tag that we're tracking");const r=$a(n.pendingWriteTree_,e);return Is(i,t,r,null)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cs{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new Cs(t)}node(){return this.node_}}class Ss{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=Y(this.path_,e);return new Ss(this.syncTree_,t)}node(){return ol(this.syncTree_,this.path_)}}const Np=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},dl=function(n,e,t){if(!n||typeof n!="object")return n;if(A(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return kp(n[".sv"],e,t);if(typeof n[".sv"]=="object")return Pp(n[".sv"],e);A(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},kp=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:A(!1,"Unexpected server value: "+n)}},Pp=function(n,e,t){n.hasOwnProperty("increment")||A(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const i=n.increment;typeof i!="number"&&A(!1,"Unexpected increment value: "+i);const r=e.node();if(A(r!==null&&typeof r<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!r.isLeafNode())return i;const l=r.getValue();return typeof l!="number"?i:l+i},Op=function(n,e,t,i){return bs(e,new Ss(t,n),i)},Dp=function(n,e,t){return bs(n,new Cs(e),t)};function bs(n,e,t){const i=n.getPriority().val(),r=dl(i,e.getImmediateChild(".priority"),t);let o;if(n.isLeafNode()){const l=n,c=dl(l.getValue(),e,t);return c!==l.getValue()||r!==l.getPriority().val()?new J(c,ie(r)):n}else{const l=n;return o=l,r!==l.getPriority().val()&&(o=o.updatePriority(new J(r))),l.forEachChild(ne,(c,d)=>{const f=bs(d,e.getImmediateChild(c),t);f!==d&&(o=o.updateImmediateChild(c,f))}),o}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class As{constructor(e="",t=null,i={children:{},childCount:0}){this.name=e,this.parent=t,this.node=i}}function Rs(n,e){let t=e instanceof W?e:new W(e),i=n,r=M(t);for(;r!==null;){const o=ft(i.node.children,r)||{children:{},childCount:0};i=new As(r,i,o),t=V(t),r=M(t)}return i}function St(n){return n.node.value}function fl(n,e){n.node.value=e,Ns(n)}function pl(n){return n.node.childCount>0}function Lp(n){return St(n)===void 0&&!pl(n)}function ii(n,e){ye(n.node.children,(t,i)=>{e(new As(t,n,i))})}function gl(n,e,t,i){t&&e(n),ii(n,r=>{gl(r,e,!0)})}function Mp(n,e,t){let i=n.parent;for(;i!==null;){if(e(i))return!0;i=i.parent}return!1}function on(n){return new W(n.parent===null?n.name:on(n.parent)+"/"+n.name)}function Ns(n){n.parent!==null&&xp(n.parent,n.name,n)}function xp(n,e,t){const i=Lp(t),r=ke(n.node.children,e);i&&r?(delete n.node.children[e],n.node.childCount--,Ns(n)):!i&&!r&&(n.node.children[e]=t.node,n.node.childCount++,Ns(n))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fp=/[\[\].#$\/\u0000-\u001F\u007F]/,Up=/[\[\].#$\u0000-\u001F\u007F]/,ks=10*1024*1024,_l=function(n){return typeof n=="string"&&n.length!==0&&!Fp.test(n)},Bp=function(n){return typeof n=="string"&&n.length!==0&&!Up.test(n)},Hp=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),Bp(n)},ml=function(n,e,t){const i=t instanceof W?new vf(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+it(i));if(typeof e=="function")throw new Error(n+"contains a function "+it(i)+" with contents = "+e.toString());if(jo(e))throw new Error(n+"contains "+e.toString()+" "+it(i));if(typeof e=="string"&&e.length>ks/3&&An(e)>ks)throw new Error(n+"contains a string greater than "+ks+" utf8 bytes "+it(i)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let r=!1,o=!1;if(ye(e,(l,c)=>{if(l===".value")r=!0;else if(l!==".priority"&&l!==".sv"&&(o=!0,!_l(l)))throw new Error(n+" contains an invalid key ("+l+") "+it(i)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);Ef(i,l),ml(n,c,i),wf(i)}),r&&o)throw new Error(n+' contains ".value" child '+it(i)+" in addition to actual children.")}},jp=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!_l(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!Hp(t))throw new Error(Qh(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wp{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function Vp(n,e){let t=null;for(let i=0;i<e.length;i++){const r=e[i],o=r.getPath();t!==null&&!wa(o,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:o}),t.events.push(r)}t&&n.eventLists_.push(t)}function at(n,e,t){Vp(n,t),zp(n,i=>Ce(i,e)||Ce(e,i))}function zp(n,e){n.recursionDepth_++;let t=!0;for(let i=0;i<n.eventLists_.length;i++){const r=n.eventLists_[i];if(r){const o=r.path;e(o)?($p(n.eventLists_[i]),n.eventLists_[i]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function $p(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const i=t.getEventRunner();Gt&&te("event: "+t.toString()),Yt(i)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gp="repo_interrupt",Kp=25;class qp{constructor(e,t,i,r){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=i,this.appCheckProvider_=r,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new Wp,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Jn(),this.transactionQueueTree_=new As,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function Yp(n,e,t){if(n.stats_=is(n.repoInfo_),n.forceRestClient_||Vd())n.server_=new Xn(n.repoInfo_,(i,r,o,l)=>{vl(n,i,r,o,l)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>El(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{Z(t)}catch(i){throw new Error("Invalid authOverride provided: "+i)}}n.persistentConnection_=new Le(n.repoInfo_,e,(i,r,o,l)=>{vl(n,i,r,o,l)},i=>{El(n,i)},i=>{Jp(n,i)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(i=>{n.server_.refreshAuthToken(i)}),n.appCheckProvider_.addTokenChangeListener(i=>{n.server_.refreshAppCheckToken(i.token)}),n.statsReporter_=qd(n.repoInfo_,()=>new qf(n.stats_,n.server_)),n.infoData_=new Vf,n.infoSyncTree_=new rl({startListening:(i,r,o,l)=>{let c=[];const d=n.infoData_.getNode(i._path);return d.isEmpty()||(c=ti(n.infoSyncTree_,i._path,d),setTimeout(()=>{l("ok")},0)),c},stopListening:()=>{}}),Ps(n,"connected",!1),n.serverSyncTree_=new rl({startListening:(i,r,o,l)=>(n.server_.listen(i,o,r,(c,d)=>{const f=l(c,d);at(n.eventQueue_,i._path,f)}),[]),stopListening:(i,r)=>{n.server_.unlisten(i,r)}})}function Xp(n){const t=n.infoData_.getNode(new W(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function yl(n){return Np({timestamp:Xp(n)})}function vl(n,e,t,i,r){n.dataUpdateCount++;const o=new W(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let l=[];if(r)if(i){const d=bn(t,f=>ie(f));l=Rp(n.serverSyncTree_,o,d,r)}else{const d=ie(t);l=Ap(n.serverSyncTree_,o,d,r)}else if(i){const d=bn(t,f=>ie(f));l=bp(n.serverSyncTree_,o,d)}else{const d=ie(t);l=ti(n.serverSyncTree_,o,d)}let c=o;l.length>0&&(c=Ds(n,o)),at(n.eventQueue_,c,l)}function El(n,e){Ps(n,"connected",e),e===!1&&Zp(n)}function Jp(n,e){ye(e,(t,i)=>{Ps(n,t,i)})}function Ps(n,e,t){const i=new W("/.info/"+e),r=ie(t);n.infoData_.updateSnapshot(i,r);const o=ti(n.infoSyncTree_,i,r);at(n.eventQueue_,i,o)}function Qp(n){return n.nextWriteId_++}function Zp(n){wl(n,"onDisconnectEvents");const e=yl(n),t=Jn();us(n.onDisconnect_,H(),(r,o)=>{const l=Op(r,o,n.serverSyncTree_,e);La(t,r,l)});let i=[];us(t,H(),(r,o)=>{i=i.concat(ti(n.serverSyncTree_,r,o));const l=ig(n,r);Ds(n,l)}),n.onDisconnect_=Jn(),at(n.eventQueue_,H(),i)}function eg(n){n.persistentConnection_&&n.persistentConnection_.interrupt(Gp)}function wl(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),te(t,...e)}function Il(n,e,t){return ol(n.serverSyncTree_,e,t)||B.EMPTY_NODE}function Os(n,e=n.transactionQueueTree_){if(e||si(n,e),St(e)){const t=Cl(n,e);A(t.length>0,"Sending zero length transaction queue"),t.every(r=>r.status===0)&&tg(n,on(e),t)}else pl(e)&&ii(e,t=>{Os(n,t)})}function tg(n,e,t){const i=t.map(f=>f.currentWriteId),r=Il(n,e,i);let o=r;const l=r.hash();for(let f=0;f<t.length;f++){const T=t[f];A(T.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),T.status=1,T.retryCount++;const I=ve(e,T.path);o=o.updateChild(I,T.currentOutputSnapshotRaw)}const c=o.val(!0),d=e;n.server_.put(d.toString(),c,f=>{wl(n,"transaction put response",{path:d.toString(),status:f});let T=[];if(f==="ok"){const I=[];for(let S=0;S<t.length;S++)t[S].status=2,T=T.concat(Ct(n.serverSyncTree_,t[S].currentWriteId)),t[S].onComplete&&I.push(()=>t[S].onComplete(null,!0,t[S].currentOutputSnapshotResolved)),t[S].unwatcher();si(n,Rs(n.transactionQueueTree_,e)),Os(n,n.transactionQueueTree_),at(n.eventQueue_,e,T);for(let S=0;S<I.length;S++)Yt(I[S])}else{if(f==="datastale")for(let I=0;I<t.length;I++)t[I].status===3?t[I].status=4:t[I].status=0;else{ge("transaction at "+d.toString()+" failed: "+f);for(let I=0;I<t.length;I++)t[I].status=4,t[I].abortReason=f}Ds(n,e)}},l)}function Ds(n,e){const t=Tl(n,e),i=on(t),r=Cl(n,t);return ng(n,r,i),i}function ng(n,e,t){if(e.length===0)return;const i=[];let r=[];const l=e.filter(c=>c.status===0).map(c=>c.currentWriteId);for(let c=0;c<e.length;c++){const d=e[c],f=ve(t,d.path);let T=!1,I;if(A(f!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),d.status===4)T=!0,I=d.abortReason,r=r.concat(Ct(n.serverSyncTree_,d.currentWriteId,!0));else if(d.status===0)if(d.retryCount>=Kp)T=!0,I="maxretry",r=r.concat(Ct(n.serverSyncTree_,d.currentWriteId,!0));else{const S=Il(n,d.path,l);d.currentInputSnapshot=S;const N=e[c].update(S.val());if(N!==void 0){ml("transaction failed: Data returned ",N,d.path);let R=ie(N);typeof N=="object"&&N!=null&&ke(N,".priority")||(R=R.updatePriority(S.getPriority()));const k=d.currentWriteId,_e=yl(n),Q=Dp(R,S,_e);d.currentOutputSnapshotRaw=R,d.currentOutputSnapshotResolved=Q,d.currentWriteId=Qp(n),l.splice(l.indexOf(k),1),r=r.concat(Sp(n.serverSyncTree_,d.path,Q,d.currentWriteId,d.applyLocally)),r=r.concat(Ct(n.serverSyncTree_,k,!0))}else T=!0,I="nodata",r=r.concat(Ct(n.serverSyncTree_,d.currentWriteId,!0))}at(n.eventQueue_,t,r),r=[],T&&(e[c].status=2,function(S){setTimeout(S,Math.floor(0))}(e[c].unwatcher),e[c].onComplete&&(I==="nodata"?i.push(()=>e[c].onComplete(null,!1,e[c].currentInputSnapshot)):i.push(()=>e[c].onComplete(new Error(I),!1,null))))}si(n,n.transactionQueueTree_);for(let c=0;c<i.length;c++)Yt(i[c]);Os(n,n.transactionQueueTree_)}function Tl(n,e){let t,i=n.transactionQueueTree_;for(t=M(e);t!==null&&St(i)===void 0;)i=Rs(i,t),e=V(e),t=M(e);return i}function Cl(n,e){const t=[];return Sl(n,e,t),t.sort((i,r)=>i.order-r.order),t}function Sl(n,e,t){const i=St(e);if(i)for(let r=0;r<i.length;r++)t.push(i[r]);ii(e,r=>{Sl(n,r,t)})}function si(n,e){const t=St(e);if(t){let i=0;for(let r=0;r<t.length;r++)t[r].status!==2&&(t[i]=t[r],i++);t.length=i,fl(e,t.length>0?t:void 0)}ii(e,i=>{si(n,i)})}function ig(n,e){const t=on(Tl(n,e)),i=Rs(n.transactionQueueTree_,e);return Mp(i,r=>{Ls(n,r)}),Ls(n,i),gl(i,r=>{Ls(n,r)}),t}function Ls(n,e){const t=St(e);if(t){const i=[];let r=[],o=-1;for(let l=0;l<t.length;l++)t[l].status===3||(t[l].status===1?(A(o===l-1,"All SENT items should be at beginning of queue."),o=l,t[l].status=3,t[l].abortReason="set"):(A(t[l].status===0,"Unexpected transaction status in abort"),t[l].unwatcher(),r=r.concat(Ct(n.serverSyncTree_,t[l].currentWriteId,!0)),t[l].onComplete&&i.push(t[l].onComplete.bind(null,new Error("set"),!1,null))));o===-1?fl(e,void 0):t.length=o+1,at(n.eventQueue_,on(e),r);for(let l=0;l<i.length;l++)Yt(i[l])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sg(n){let e="";const t=n.split("/");for(let i=0;i<t.length;i++)if(t[i].length>0){let r=t[i];try{r=decodeURIComponent(r.replace(/\+/g," "))}catch{}e+="/"+r}return e}function rg(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const i=t.split("=");i.length===2?e[decodeURIComponent(i[0])]=decodeURIComponent(i[1]):ge(`Invalid query segment '${t}' in query '${n}'`)}return e}const bl=function(n,e){const t=og(n),i=t.namespace;t.domain==="firebase.com"&&De(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!i||i==="undefined")&&t.domain!=="localhost"&&De("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||Md();const r=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new ea(t.host,t.secure,i,r,e,"",i!==t.subdomain),path:new W(t.pathString)}},og=function(n){let e="",t="",i="",r="",o="",l=!0,c="https",d=443;if(typeof n=="string"){let f=n.indexOf("//");f>=0&&(c=n.substring(0,f-1),n=n.substring(f+2));let T=n.indexOf("/");T===-1&&(T=n.length);let I=n.indexOf("?");I===-1&&(I=n.length),e=n.substring(0,Math.min(T,I)),T<I&&(r=sg(n.substring(T,I)));const S=rg(n.substring(Math.min(n.length,I)));f=e.indexOf(":"),f>=0?(l=c==="https"||c==="wss",d=parseInt(e.substring(f+1),10)):f=e.length;const N=e.slice(0,f);if(N.toLowerCase()==="localhost")t="localhost";else if(N.split(".").length<=2)t=N;else{const R=e.indexOf(".");i=e.substring(0,R).toLowerCase(),t=e.substring(R+1),o=i}"ns"in S&&(o=S.ns)}return{host:e,port:d,domain:t,subdomain:i,secure:l,scheme:c,pathString:r,namespace:o}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ms{constructor(e,t,i,r){this._repo=e,this._path=t,this._queryParams=i,this._orderByCalled=r}get key(){return O(this._path)?null:ya(this._path)}get ref(){return new bt(this._repo,this._path)}get _queryIdentifier(){const e=Da(this._queryParams),t=Qi(e);return t==="{}"?"default":t}get _queryObject(){return Da(this._queryParams)}isEqual(e){if(e=Je(e),!(e instanceof Ms))return!1;const t=this._repo===e._repo,i=wa(this._path,e._path),r=this._queryIdentifier===e._queryIdentifier;return t&&i&&r}toJSON(){return this.toString()}toString(){return this._repo.toString()+yf(this._path)}}class bt extends Ms{constructor(e,t){super(e,t,new cs,!1)}get parent(){const e=Ea(this._path);return e===null?null:new bt(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}Tp(bt),Cp(bt);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ag="FIREBASE_DATABASE_EMULATOR_HOST",xs={};let lg=!1;function hg(n,e,t,i){n.repoInfo_=new ea(e,!1,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0,t),i&&(n.authTokenProvider_=i)}function cg(n,e,t,i,r){let o=i||n.options.databaseURL;o===void 0&&(n.options.projectId||De("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),te("Using default host for project ",n.options.projectId),o=`${n.options.projectId}-default-rtdb.firebaseio.com`);let l=bl(o,r),c=l.repoInfo,d;typeof process<"u"&&process.env&&(d=process.env[ag]),d?(o=`http://${d}?ns=${c.namespace}`,l=bl(o,r),c=l.repoInfo):l.repoInfo.secure;const f=new $d(n.name,n.options,e);jp("Invalid Firebase Database URL",l),O(l.path)||De("Database URL must point to the root of a Firebase Database (not including a child path).");const T=dg(c,n,f,new zd(n,t));return new fg(T,n)}function ug(n,e){const t=xs[e];(!t||t[n.key]!==n)&&De(`Database ${e}(${n.repoInfo_}) has already been deleted.`),eg(n),delete t[n.key]}function dg(n,e,t,i){let r=xs[e.name];r||(r={},xs[e.name]=r);let o=r[n.toURLString()];return o&&De("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),o=new qp(n,lg,t,i),r[n.toURLString()]=o,o}class fg{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(Yp(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new bt(this._repo,H())),this._rootInternal}_delete(){return this._rootInternal!==null&&(ug(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&De("Cannot call "+e+" on a deleted database.")}}function pg(n=xi(),e){const t=Nn(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const i=yr("database");i&&gg(t,...i)}return t}function gg(n,e,t,i={}){n=Je(n),n._checkNotDeleted("useEmulator");const r=`${e}:${t}`,o=n._repoInternal;if(n._instanceStarted){if(r===n._repoInternal.repoInfo_.host&&He(i,o.repoInfo_.emulatorOptions))return;De("connectDatabaseEmulator() cannot initialize or alter the emulator configuration after the database instance has started.")}let l;if(o.repoInfo_.nodeAdmin)i.mockUserToken&&De('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),l=new Vn(Vn.OWNER);else if(i.mockUserToken){const c=typeof i.mockUserToken=="string"?i.mockUserToken:Er(i.mockUserToken,n.app.options.projectId);l=new Vn(c)}hg(o,r,i,l)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _g(n){Nd(Mt),Ze(new je("database",(e,{instanceIdentifier:t})=>{const i=e.getProvider("app").getImmediate(),r=e.getProvider("auth-internal"),o=e.getProvider("app-check-internal");return cg(i,r,o,t)},"PUBLIC").setMultipleInstances(!0)),Re(Mo,xo,n),Re(Mo,xo,"esm2017")}Le.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)},Le.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)},_g();const G=(Nl=(Rl=globalThis.browser)==null?void 0:Rl.runtime)!=null&&Nl.id?globalThis.browser:globalThis.chrome,mg={apiKey:"AIzaSyAnHyYS-zdzfiTe97jJDfEaf1HxqmvLzmc",authDomain:"conflictology-conflict.firebaseapp.com",projectId:"conflictology-conflict",storageBucket:"conflictology-conflict.appspot.com",messagingSenderId:"205495071119",appId:"1:205495071119:web:c9077530939d71160c1bfa",databaseURL:"https://conflictology-conflict-default-rtdb.firebaseio.com"};let Fs=Dr().length?Dr()[0]:Or(mg);const Us=cd(Fs);Rd(Fs),pg(Fs),Yu(Us,go),G.storage.local.get("user").then(({user:n})=>{n&&n.uid?(console.log("Found user in local storage, authenticating with Firebase..."),Al(n.uid).then(()=>console.log("Successfully initialized Firebase auth from storage")).catch(e=>console.error("Failed to initialize Firebase auth from storage:",e))):console.log("No user found in local storage")});const Al=async n=>{var e;try{console.log("Authenticating with Firebase using UID:",n),console.log("Fetching custom token from API...");const t=await fetch("https://conflictology-web.vercel.app/api/auth/token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:n})});if(console.log("API response status:",t.status),!t.ok){const c=await t.json();throw console.error("API error response:",c),new Error(c.error||"Failed to get custom token")}const i=await t.json();console.log("API response data:",i);const{customToken:r}=i;if(console.log("Custom token received:",r?r.substring(0,10)+"...":"None"),!r)throw new Error("No custom token received");console.log("Signing in with custom token...");const o=await qu(Us,r);console.log("Sign in successful, user:",(e=o.user)==null?void 0:e.uid);const l=Us.currentUser;return console.log("Current Firebase user after authentication:",l==null?void 0:l.uid),o}catch(t){throw console.error("Authentication error:",t),t}},yg=Rh(()=>{const n=!!G.sidePanel&&!!G.sidePanel.open;G.action.onClicked.addListener(l=>{if(n)try{const c=l.windowId;c&&G.sidePanel.open({windowId:c})}catch(c){console.error("Error opening side panel:",c),G.tabs.create({url:"standalone.html"})}else G.tabs.create({url:"standalone.html"})}),console.log("Side Panel Support: "+(n?"Yes":"No")),G.runtime.onInstalled.addListener(l=>{l.reason!=="chrome_update"&&l.reason==="install"&&G.tabs.create({url:"https://conflictologygames.com/rules"})});const e="/offscreen.html";let t=null;async function i(){return(await self.clients.matchAll()).some(c=>c.url===G.runtime.getURL(e))}async function r(){await i()||(t?await t:(t=G.offscreen.createDocument({url:G.runtime.getURL(e),reasons:[G.offscreen.Reason.DOM_SCRAPING],justification:"Firebase Authentication"}),await t,t=null))}async function o(){return await r(),new Promise((l,c)=>{G.runtime.sendMessage({action:"getAuth",target:"offscreen"},d=>{G.runtime.lastError?c(G.runtime.lastError):l(d)})})}G.runtime.onMessage.addListener((l,c,d)=>l.action==="signIn"?(o().then(async f=>{if(!f||!f.uid){console.error("Failed to get valid user from auth flow"),d({error:"Authentication failed"});return}console.log("Authentication successful for:",f.email||f.uid);const T={uid:f.uid,email:f.email,displayName:f.displayName};if(console.log("Minimal user object:",T),f.uid){const I=await Al(f.uid);console.log("Firebase authentication response:",I)}await G.storage.local.set({user:T}),G.runtime.sendMessage({type:"AUTH_STATE_CHANGED",user:T}),d({user:T})}).catch(f=>{console.error("Authentication error:",f),d({error:f.message})}),!0):l.action==="signOut"?((async()=>{try{console.log("Processing sign out request"),await G.storage.local.remove("user"),G.runtime.sendMessage({type:"AUTH_STATE_CHANGED",user:null}),console.log("Sign out complete"),d({success:!0})}catch(f){console.error("Error during sign out:",f),d({error:String(f)})}})(),!0):!1),G.tabs.onUpdated.addListener((l,c,d)=>{var f,T;if((f=d.url)!=null&&f.startsWith("https://accounts.google.com/o/oauth2/auth/")||(T=d.url)!=null&&T.startsWith("https://conflictology-conflict.firebaseapp.com")){d.windowId&&G.windows.update(d.windowId,{focused:!0});return}})});function s_(){}function ri(n,...e){}const vg={debug:(...n)=>ri(console.debug,...n),log:(...n)=>ri(console.log,...n),warn:(...n)=>ri(console.warn,...n),error:(...n)=>ri(console.error,...n)};let Bs;try{Bs=yg.main(),Bs instanceof Promise&&console.warn("The background's main() function return a promise, but it must be synchronous")}catch(n){throw vg.error("The background crashed on startup!"),n}return Bs}();
background;
