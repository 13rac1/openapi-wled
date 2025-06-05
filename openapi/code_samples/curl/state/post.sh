#!/bin/bash
# Update WLED device state - turn on and set brightness
curl -X POST "http://192.168.1.100/json/state" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "on": true,
    "bri": 128,
    "transition": 7,
    "v": true
  }' 