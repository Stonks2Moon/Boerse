# How To

## Order stellen

Über unser [NPM Modul](https://www.npmjs.com/package/moonstonks-boersenapi) könnt ihr ganz einfach Orders jeglicher Art stellen.  
Hierzu müsst ihr die API und den OrderManager initialisieren:

```ts
import { BörsenAPI, OrderManager } from 'moonstonks-boersenapi';

const api = new BörsenAPI("Euer API Token");
const orderManager = new OrderManager(api, 'onPlace', 'onMatch', 'onComplete', 'onDelete');
```

Den API Token erhaltet ihr von uns. 'onPlace', 'onMatch', 'onComplete', 'onDelete' sind Endpunkte, welche von der Börse aufgerufen werden müssen. Was diese im einzelnen schicken und bedeuten wird folglich erklärt.

### onPlace
Wenn ihr eine Order platzieren wollt, so könnt ihr dies mit Hilfe des OrderManagers. Dieser bietet Funktionen für jede Art von Orders und eine generische Methode, bei welcher die Parameter optional mitgegeben werden können.
Als Antwort erhaltet ihr entweder einen Fehler, welchen ihr mit einem '.catch' abfangen könnt. Mögliche Fehler können ein fehlerhaftes Token, fehlende Angaben, eine ungültige shareId oder einen bestimmter Job sein.

Die mitgelieferte jobId ist nur solange gültig bis der Job ausgeführt wurde. Da sich dieser Job darauf konzentriert eine Order zu stellen, wird nach erfolgreichem Ausführen der mitgelieferte 'onPlace' Endpunkt eures Backends aufgerufen. Es handelt sich hierbei um einen POST Request, welcher eure platzierte Order beinhaltet.

### onMatch
Der onMatch Endpunkt wird in eurem Backend augerufen, sobald eine eingestellte Order ein Match hatte. Auch hier handelt es sich um einen Post Request, welcher die orderId, den timestamp und die Anzahl der gematchen Shares mitgibt.

### onComplete
Dieser Endpunkt wird aufgerufen, sobald jeder Share eurer Order gematched wurde (die restliche Amount also null ist). Der Post Request beinhaltet hierbei nochmals die orderId und einen timestamp.

### onDelete
Sobald eine Order platziert wurde, kann diese auch wieder aus dem Orderbuch entfernt werden. Dies geschieht nicht direkt, da eure Order möglicherweise in einem Matchingverfahren steckt. Deshalb erhaltet ihr beim Versuch eine Order zu löschen zunächst einen Job als Antwort. Dieser hat eine höhere Priorität, als der Job einer neuen Orderplatzierung und wird deshalb zuerst ausgeführt. Sobald dieser Job erledigt ist, wird der in 'onDelete' angegebene Endpunkt aufgerufen, welcher euch in einem POST Request die orderId, einen timestamp und die verbliebenen Anzahl an Shares mitgibt.

## Order stellen in einem Schaubild erklärt

TODO:
