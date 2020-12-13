

class Util {
  static createParams(data) {
    const params = [];
    for (const [key, value] of Object.entries(data)) {
      params.push(`${key}=${value}`);
    }
    return params.join('&')
  }
  static getUrlVars() {
    var vars = [],
      hash;
    var params = decodeURI(window.location.href
    .slice(window.location.href.indexOf("?") + 1));
    var hashes = params.split("&");
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split("=");
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  }
}