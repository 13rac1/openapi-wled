#!/bin/bash
# Get current WLED device state
curl -X GET "http://192.168.1.100/json/state" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" 