from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ipaddress

app = FastAPI(title="Subnetting Tool API")

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in production, you might want to restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SubnetRequest(BaseModel):
    ip: str
    subnet: str

@app.post("/calculate")
def calculate_subnet(req: SubnetRequest):
    try:
        # Determine if subnet is CIDR (e.g. "24") or mask (e.g. "255.255.255.0")
        subnet_val = req.subnet.strip()
        
        # Validation for CIDR > 32
        if subnet_val.isdigit() and int(subnet_val) > 32:
            raise ValueError("CIDR prefix must be between 0 and 32")

        # Check if subnet is just a number (CIDR) without the slash
        if subnet_val.isdigit() and 0 <= int(subnet_val) <= 32:
            network_string = f"{req.ip}/{subnet_val}"
        else:
            network_string = f"{req.ip}/{subnet_val}"
            
        # Parse the network; this ensures both IP and subnet are valid
        network = ipaddress.IPv4Network(network_string, strict=False)
        ip_obj = ipaddress.IPv4Address(req.ip)
        
        # Calculate basic properties
        network_address = str(network.network_address)
        broadcast_address = str(network.broadcast_address)
        
        # Handle /32 and /31 special cases efficiently
        if network.prefixlen == 32:
            first_host = "N/A"
            last_host = "N/A"
            usable_hosts = 1
        elif network.prefixlen == 31:
            first_host = str(network[0])
            last_host = str(network[1])
            usable_hosts = 2
        else:
            first_host = str(network.network_address + 1)
            last_host = str(network.broadcast_address - 1)
            usable_hosts = network.num_addresses - 2
            
        total_hosts = network.num_addresses
        
        # Determine IP Class based on the first octet
        first_octet = int(req.ip.split('.')[0])
        if 1 <= first_octet <= 126:
            ip_class = "A"
        elif first_octet == 127:
            ip_class = "Loopback"
        elif 128 <= first_octet <= 191:
            ip_class = "B"
        elif 192 <= first_octet <= 223:
            ip_class = "C"
        elif 224 <= first_octet <= 239:
            ip_class = "D"
        else:
            ip_class = "E"

        # Determine IP Type (Public, Private, etc.)
        if ip_obj.is_private:
            ip_type = "Private"
        elif ip_obj.is_loopback:
            ip_type = "Loopback"
        elif ip_obj.is_multicast or ip_obj.is_reserved or ip_obj.is_link_local:
            ip_type = "Reserved"
        else:
            ip_type = "Public"

        # Binary Representation of IP address
        ip_binary = ".".join([f"{int(octet):08b}" for octet in req.ip.split('.')])

        return {
            "network": network_address,
            "broadcast": broadcast_address,
            "first_host": first_host,
            "last_host": last_host,
            "total_hosts": total_hosts,
            "usable_hosts": usable_hosts,
            "ip_class": ip_class,
            "ip_type": ip_type,
            "ip_binary": ip_binary
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid IP address or Subnet mask/CIDR.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred during calculation.")
