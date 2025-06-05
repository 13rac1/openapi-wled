#!/bin/bash
# Get complete WLED device configuration
curl -X GET "http://192.168.1.100/json/cfg" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" 