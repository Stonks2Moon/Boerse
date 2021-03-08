# How To

## Order stellen

Über unser [NPM Modul](https://www.npmjs.com/package/moonstonks-boersenapi) könnt ihr ganz einfach Orders jeglicher Art stellen.  
Hierzu müsst ihr einerseits die API und den OrderManager initialisieren:

```ts
import { BörsenAPI, OrderManager } from 'moonstonks-boersenapi';

const api = new BörsenAPI("Euer API Token");
const orderManager = new OrderManager(api, 'onPlace', 'onMatch', 'onComplete', 'onDelete');
```

Den API Token erhaltet ihr von uns, 'onPlace', 'onMatch', 'onComplete', 'onDelete' sind Endpunkte, welche von der Börse aufgerufen werden können müssen. Was diese im einzelnen schicken und bedeutet wird folglich erklärt.

### onPlace
Wenn ihr eine Order platzieren wollt, so könnt ihr dies mit Hilfe des OrderManagers. Dieser bietet funktionen für jede Art von Order und eine generische Methode, bei welcher die Parameter auch optional mitgegeben werden können.
Als Antwort erhaltet ihr entweder einen Fehler, welchen ihr mit einem .catch abfangen könnt. Mögliche Fehler könnten ein fehlerhaftes Token, fehlende Angaben oder eine ungültige shareId sein; oder einen Job.

Die mitgelieferte jobId ist nur solange gültig bis der Job ausgeführt wurde. Da sich dieser Job darauf konzentriert eine Order zu stellen wird nach erfolgreichem Ausführen der mitgelieferte onPlace Endpunkt eueres Backends aufgerufen. Es handelt sich hierbei um einen POST Request, welcher eure platzierte Order beinhaltet.

### onMatch
Der onMatch Endpunkt wird in eurem Backend augerufen, sobald eine Order die ihr eingestellt habt ein Match hatte. Auch hier handelt es sich um einen Post Request, welcher die orderId, den timestamp und die anzahl der gematchen shares mitgibt.

### onComplete
Dieser Endpunkt wird aufgerufen, sobald jeder share eurer Order gematched wurde (Der restliche amount als null ist). Der Post Request beinhaltet hierbei nochmals die orderId und einen timestamp.

### onDelete
Sobald eine Order platziert wurde, kann diese auch wieder ungelistet werden. Dies geschieht nicht direkt, da eure Order möglicherweise in einem Matchingverfahren steckt. Deshalb erhaltet ihr beim Versuch eine Order zu löschen zunächst einen Job als Antwort. Dieser hat eine höhere Priorität als der einer neuen Orderplatzierung und wird deshalb vor einer neuen Platzierung ausgeführt. Sobald dieser Job erledigt ist, wird der in "onDelete" angegebene Endpunkt aufgerufen, welcher euch in einem POST Request die orderId, einen timestamp und die verbliebenen Anzahl an shares mitgibt.

## Order stellen in einem Schaubild erklärt

TODO:
