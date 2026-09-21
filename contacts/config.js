// Set only a public HTTPS form endpoint. Never put API secrets in client code.
// Contract: multipart/form-data POST; HTTP 2xx and JSON {ok:true} only after acceptance.
window.IFTORA_CONTACT_CONFIG=Object.freeze({endpoint:"",timeoutMs:20000});
