const ipaddr = require("ipaddr.js");



function validateClientIP(socket) {
  const ALLOWED_IP = (process.env.ALLOWED_IP || "").split(",").map(ip => {
    const [ipOrSubnet, cidr] = ip.trim().split("/");
    return {
      ip: ipOrSubnet,
      cidr: cidr ? parseInt(cidr) : 32,
    };
  });


  let ip;
  if (socket.handshake && socket.handshake.address) {
    ip = socket.handshake.address;
  } else if (socket.ip) {
    ip = socket.ip;
  } else if (socket.headers && socket.headers['x-forwarded-for']) {
    ip = socket.headers['x-forwarded-for'].split(',')[0].trim();
  } else if (socket.request && socket.request.headers && socket.request.headers['x-forwarded-for']) {
    ip = socket.request.headers['x-forwarded-for'].split(',')[0].trim();
  } else if (socket.request && socket.request.ip) {
    ip = socket.request.ip;
  } else if (socket.connection && socket.connection.remoteAddress) {
    ip = socket.connection.remoteAddress;
  } else if (socket.remAddress) {
    ip = socket.remAddress;
  } else {
    ip = 'unknown';
  }
  const clientIP = ip.split(":").pop();

//   console.log("clientIP", clientIP);
//   console.log("ALLOWED_IP", ALLOWED_IP);

  let addr;

  try {
    addr = ipaddr.parse(clientIP);

    // Convert IPv4-mapped IPv6 to IPv4
    if (addr.kind() === "ipv6" && addr.isIPv4MappedAddress()) {
      addr = addr.toIPv4Address();
    }
  } catch (err) {
    console.log("Invalid IP format:", clientIP);
    return false;
  }

  const allowed = ALLOWED_IP.some(({ ip, cidr }) => {
    try {
      let range = ipaddr.parse(ip);

      if (range.kind() === "ipv6" && range.isIPv4MappedAddress()) {
        range = range.toIPv4Address();
      }

      // CIDR match
      return addr.match(range, cidr);
    } catch {
      return false;
    }
  });

  console.log(allowed ? "Accepted" : "Rejected IP:", clientIP);

  return allowed;
  
}

module.exports = { validateClientIP };
