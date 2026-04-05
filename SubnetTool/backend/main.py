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
        
        # Check if subnet is just a number (CIDR) without the slash
        if subnet_val.isdigit() and 0 <= int(subnet_val) <= 32:
            network_string = f"{req.ip}/{subnet_val}"
        else:
            network_string = f"{req.ip}/{subnet_val}"
            
        # Parse the network
        network = ipaddress.IPv4Network(network_string, strict=False)
        
        # Calculate properties
        network_address = str(network.network_address)
        broadcast_address = str(network.broadcast_address)
        
        # Handle /32 and /31 special cases
        if network.prefixlen == 32:
            first_host = "N/A"
            last_host = "N/A"
            total_hosts = 1
        elif network.prefixlen == 31:
            first_host = str(network[0])
            last_host = str(network[1])
            total_hosts = 2
        else:
            hosts = list(network.hosts())
            first_host = str(hosts[0]) if hosts else "N/A"
            last_host = str(hosts[-1]) if hosts else "N/A"
            # hosts() returns usable hosts
            total_hosts = network.num_addresses - 2
            
        subnet_mask = str(network.netmask)
        cidr = f"/{network.prefixlen}"
        
        return {
            "network_address": network_address,
            "broadcast_address": broadcast_address,
            "first_host": first_host,
            "last_host": last_host,
            "total_hosts": str(total_hosts),
            "subnet_mask": subnet_mask,
            "cidr": cidr
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred during calculation.")
