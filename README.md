# Boerse
## Anforderungen
### Must have
* Bietet einen fortlaufenden Handel mit Orderbuch
* Stellt Rechnungen an Broker
* Bietet ein Controlling für Admins mit Unterbrechungsmöglichkeit
* Schreibt einen Clearingbericht 
* Kommuniziert aktuelle Kurse

### Nice to have
* Bietet Auktionen 
* Bietet internes Clearing für Broker an
* Schafft automatische Unterbrechungsmöglichkeiten (sogenannte Volas)

## Schnittstellen (REST)
### GET-Requests
* aktueller Preis eines bestimmten Wertpapiers
* historischer Preisverlauf eines Wertpapiers zur Überwachung der Marktenwticklung
* Status der Order (wurde die Order schon ausgeführt?)

### POST-Requests
* Order einstellen
  * Market-Order
  * Limit-Order
  * Stop-Market-Order
  * Stop-Limit-Order

### DELETE-Request
* Order löschen

## Benachrichtigungen über Sockets
* Änderungen beim Referenzpreis
* Nachricht der Orderausführung an den Broker

## Technologien
### Frontend
TBD

### Backend
* Nest.js
* MongoDB
* Swagger-UI zur Darstellung der REST Schnittstellen
* Socket.io
