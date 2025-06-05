#!/bin/bash
# Update WLED device configuration - change device name and default brightness
# WARNING: Configuration changes can make device inaccessible
curl -X POST "http://192.168.1.100/json/cfg" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "id": {
      "name": "Living-Room-WLED"
    },
    "def": {
      "ps": 1,
      "on": true,
      "bri": 200
    },
    "light": {
      "scale-bri": 90
    }
  }' 