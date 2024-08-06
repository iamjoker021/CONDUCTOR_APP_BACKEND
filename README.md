# Condiuctor App - Backend
This is my personal project to build a Conductor App for easing payment solution via UPI. This Repo is back-end for that application

## Why ?
To enable digital payment in intra-city bus

## What ?
A Application where user can directly purchase bus ticket by providing Source/Destination and pay via UPI/any digital way

## How App functions?
1. The passenger can enter Source, Destination, and Bus-Type. 
2. Then pay the price via digital payment
3. Passenger received QR/serialNo as confirmation on app which is valid for 'Average Travel time' + 20mins
4. The Conductor can verify the ticket using QR/serialNo (if required)

## Braistorm points
1. Why Passenger should enter detials instead of conductor? - We enables passengers to take the ticket so that instead 1 conductor enter the info for whole bus, passenger can enter details and take bus ticket. The conductor if required only need to verify the ticket by scanning the QR/serialNo

## Internal working
There are two part to this App
1. Passenger Vierw
2. Conductor View

### Passenger View:
1. *Passenger should be able to provide Source, Destination, BusType, noOfPPassengers
2. *Passenger should be able to select digital payement
3. *Customer should be able to view and show to conductor the tickets that has been taken for verification

### Conductor View:
1. *Conductor should be able to scan the QR and verify the ticket
2. Conductor should be able to view no of tickets taken on online via the App on that particular trip

User schema
id
name
email
phoneno
passenger/conductor

ticket schema
ticketUniqueIdentifier
ticketQR
NoOfPassengers
