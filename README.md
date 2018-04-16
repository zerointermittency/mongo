# Bienvenido

Este modulo es el encargado de proporcionar el conector para trabajar con la base de datos [mongodb][mongodb].

## Instalación

```bash
yarn add @zerointermittency/mongo
# npm i --save @zerointermittency/mongo
```

## Errores estandarizados

código | nombre   | mensaje
-------|----------|--------------
100    |internal  |Internal error
101    |validate  |Validate error

## Api

El modulo utiliza **[mongoose][mongoose]**, para poder utilizar sus funcionalidades e incluir funcionalidades extras a los esquemas con los que esta librería conecta a [mongodb][mongodb].

##### Iniciar

Se debe instanciar un objeto como se hace a continuación:

```javascript
const ZIMongo = require('zi-mongo');
let mongo = new ZIMongo({
    connections: {Auth: {uri: 'localhost/Auth'},
    debug: true,
});
```

**Argumentos**:

- opts \(*Object*\):
    - connections \(*Object*\) **required**: diccionario con las base de datos que desea utilizar, donde la clave es el nombre de referencia y el valor es un objeto con las opciones para la conexión.
    - debug \(*Boolean*\): si esta activa permite ver en la linea de comandos las consultas que se realizan en cada flujo de la aplicación, default: false

**Retorna**:

- \(*ZIMongo*\): Retorna la instancia de la clase **ZIMongo**.

##### Atributo **mongoose**

Este atributo contiene la utilidad [mongoose][mongoose], con la cual se pueden realizar todas las operaciones que están documentadas [aquí][docs-mongoose]

##### Atributo **connections**

Este atributo es un diccionario que contiene todas las conexiones que se han registrado en la instancia de mongo, donde la llave de cada atributo del objeto es el nombre que se le asigno a la conexión y el valor del atributo es la conexión como la interpreta mongoose

##### Método **model**

Este es el principal método de este modulo, es quien nos va a proveer el modelo para realizar consultas a la base de datos y manejar de manera correcta las operaciones CRUD y volcado de gran cantidad de información

```javascript
const model = mongo.model({
    name: 'Model',
    connection: 'Auth',
    attrs: {
        name: {type: 'String'},
        // others attrs
    },
});
```

**Argumentos**:

- opts \(*Object*\):
    - name \(*String*\) **required**: nombre que identifica la colección de documentos en mongodb
    - connection \(*String*\) **required**: nombre que identifica la conexión, del modelo a utilizar
    - attrs \(*Object*\) **required**: diccionario con los atributos que tiene la colección y las opciones correspondientes para cada uno
    - indexes \(*Array*\): listado de diccionarios los cuales pueden tener uno o mas atributos que componen el [indice][mongodb-indexes]
    - methods \(*Object*\): diccionario con funcionalidades que se desean asociar a cada documento de la colección
    - pre \(*Object*\): funciones que se pueden ejecutar antes de una acción
    - post \(*Object*\): funciones que se pueden ejecutar después de una acción

> mas información sobre que funciones pre y post pueden realizar [aquí][mongoose-middleware]

**Retorna**:

- \(*Model*\): Retorna el modelo para realizar las operaciones y consultas

## Model

Cada modelo corresponde a cada colección de documentos que se encuentra en la base de datos, por defecto mongoose genera un [Schema][mongoose-schema] y este es extendido para entregarle mayor funcionalidad y resguardar la integridad de las relaciones entre documentos

> **Importante:** todos los modelos registrados no son estrictos, esto quiere decir que pueden setearse atributos que no están definidos. Con lo cuál es necesario recordar que al obtener el documento desde una consulta y se quiere ver ese atributo que no estaba definido en el model, se tiene que utilizar el método **.get**.

### Atributos por defecto

Con el objetivo de estandarizar las operaciones CRUD, todos los modelos poseen por defecto los siguientes atributos

```javascript
{
    _createDate: {type: 'Date', index: true, default: now},
    _updateDate: {type: 'Date', index: true},
    _deleteDate: {type: 'Date', index: true},
    _deleted: {type: 'Boolean', index: true},
    _seed: {type: 'Boolean', index: true},
    _externalId: {type: 'String', index: true},
    _externalProvider: {type: 'String', index: true},
    status: {type: 'Number', index: true},
}
```

Todos estos atributos son reservados con el objetivo de ser utilizados según corresponda en cada operación CRUD.

- _createDate: este al momento de guardar un nuevo documento, por defecto toma la fecha actual en UTC
- _updateDate: en cada actualización se asocia la fecha en UTC
- _deleteDate: esta es guardada cuando se realiza un borrado lógico
- _deleted: identifica si fue borrado lógico
- _seed: identifica si el documento es una semilla de data (esto es utilizado cuando se realizan pruebas o se generan demos)
- _externalId: identifica a que contenido externo esta asociado, este se utiliza solamente cuando se trabaja con información externa de un proveedor
- _externalProvider: este identifica el proveedor desde el cual se trae información externa
- status: este atributo se utiliza para manejar los estados de un documento \(**este es el único de los elementos que puede ser sobrescrito**\)

### Tipos personalizados

Ya que los [tipos por defecto][mongoose-types] son limitados, se han creado los siguientes con el objetivo de estandarizar uso, validación y guardado

#### Available

```javascript
{
    available: {type: 'Available'},
}
```

Al ser definido lo que se espera en el atributo es un objeto con una fecha desde y hasta cuanto esta disponible el documento (tiene como objetivo poder programar la visualización de un documento entre determinadas fechas, sin tener que estar creando y borrando manualmente)

Ejemplo:

```javascript
{
    available: {
        from: '2017-01-10T13:00:00Z',
        until: '208-01-01T00:00:00Z'
    }
}
```

> **until** no es requerido y **from** si no es definido por defecto toma la fecha actual

#### LocalizableString

```javascript
{
    localizable: {type: 'LocalizableString'},
}
```

Al ser definido tiene que contener un diccionario con las traducciones a los distintos idiomas siendo la clave el lenguaje y el valor la traducción correspondiente. Siempre debe incluir la clave **original** la cual se toma por defecto cuando no existe la traducción en un lenguaje especifico

Ejemplo:

```javascript
{
    localizable: {
        original: 'Hello word!',
        es: 'Hola mundo!',
        // otras traduciones
    }
}
```

#### LocalizableCountry

```javascript
{
    country: {type: 'LocalizableCountry'},
}
```

Al ser definido se espera un string de 2 letras [(ISO 3166-1 Alpha-2)][iso-countries] o un **LocalizableCountry**, al ser un string de 2 letras se genera el objecto LocalizableCountry.

Ejemplo:

```javascript
{
    country: 'US',
}
// o objeto LocalizableCountry
{
    country: {
        code: 'US',
        name: {
            original: 'United States of America',
            es: 'Estados Unidos',
            // otras traducciones
        },
    },
}
```

> siempre se devuelve la estructura con **code** (ISO 3166-1 Alpha-2) y **name** con la estructura **LocalizableString** con el nombre del país correspondiente en distintos idiomas


### Relaciones

Con el objetivo de poder tener relacionados los documentos y que esta relación pueda ser mutua uno a uno, uno a muchos, muchos a muchos. Se agrega a las opciones de los atributos **relation** (siempre tener en consideración que debe ser utilizado en atributos que tienen **type: 'ObjectId'**)

Ejemplo:

```javascript
// modelos en conexión local

// modelo A
{
    b: {
        type: ['ObjectId'],
        relation: {name: 'B', connection: 'local', attr: 'a'}
    }
}


// modelo B
{
    a: {
        type: 'ObjectId',
        relation: {name: 'A', connection: 'local', attr: 'b'}
    }
}
```

En el ejemplo anterior es una relación uno a muchos, donde cada documento de **B** tiene definido en el atributo **a** el documento de **A** al que esta asociado.

Por otro lado cuando se registra en **A** en el atributo **b** un documento de **B**, automaticamente se agrega en **B** en el atributo **a** la referencia al _id del documento de **A**

**Argumentos**:

- name \(*String*\) **required**: nombre del modelo al cual esta relacionado el atributo
- connection \(*String*\) **required**: nombre de la conexión donde se encuentra el modelo al cual esta asociado
- attr \(*String*\) **required**: atributo de destino donde se registra la asociación de la relación


### CRUD

Estas operaciones son las mas importantes que se realizan en los documentos de base de datos y con el objetivo de extender para mantener información relevante, como la fecha de creación, fecha de actualización y simular una papelera con los elementos borrados lógicamente. Los modelos poseen las siguientes funciones.

#### _create

Crear un nuevo documento:

```javascript
Model._create({name: 'foo'})
    .then((doc) => {
        // manipular doc
    })
    .catch((error) => {
        // logger error
    });
```

**Argumentos**:

- doc \(*Object*\) **required**: objeto que representa el documento a crear

**Retorna**:

- \(*Promise*\): Retorna una promesa
    - then (doc): recibe como argumento el documento ya creado en la base de datos con los atributos correspondientes incluyendo **_createDate** y **_id**
    - catch (error):
        - Errores estandarizados (internal, validate)
        - Errores no controlados

#### _read

Detalle de un documento

```javascript
Model._read(_id, opts)
    .then((doc) => {
        // manipular doc
    })
    .catch((error) => {
        // logger error
    });
```

**Argumentos**:

- _id \(*ObjectId*\) **required**: ObjectId que identifica el documento
- opts \(*Object*\):
    - select \(*Object/Array/String*\): arreglo o string separado por espacio de atributos que se desean seleccionar del documento ```{attr1: 1, attr2: 0} || ['attr1', '-attr2'] || 'attr1 -attr2' ```
    - lean \(*Boolean*\): si esta activo el documento obtenido no posee los métodos, ya que se transforma a un objeto plano, por defecto: **true**
    - json \(*Boolean*\): si esta activo devuelve el documento listo para entregarlo como json (la diferencia con lean es que se formatean las fechas a ISO), por defecto: **false**
    - populate \(*Object/Array/String*\): necesario para poblar la información relacionada a otro documento, más info en [populate][mongoose-populate]

**Retorna**:

- \(*Promise*\): Retorna una promesa
    - then (doc): recibe como argumento el documento en la base de datos, agregando o quitando según las opciones que se hayan proporcionado.
    - catch (error):
        - Errores estandarizados (internal)
        - Errores no controlados

#### _update

Actualizar un documento. Hay 2 tipos de actualización:

- patch: reemplaza solo los atributos enviados
- put: reemplaza totalmente el documento

```javascript
Model._update(updateDoc, type)
    .then((doc) => {
        // manipular doc
    })
    .catch((error) => {
        // logger error
    });
```

**Argumentos**:

- updateDoc \(*Object*\) **required**: documento a actualizar, este debe contener _id para encontrar que modificar
    - $unset \(*Array*\): esta opción permite quitar atributos del documento (**cada elemento del array debe ser un path de lo que se desea quitar del objeto al actualizarlo**)
- type \(*String*\): identifica como actualizar el documento, si se reemplaza totalmente o solo algunos atributos, default: patch

**Retorna**:

- \(*Promise*\): Retorna una promesa
    - then (doc): recibe como argumento el documento actualizado de la base de datos, que contiene el atributo **_updateDate**
    - catch (error):
        - Errores estandarizados (internal, validate)
        - Errores no controlados

#### _delete

Eliminar un documento. Hay 2 tipos de eliminación:

- **logical**: agrega un atributo para filtrar y no desplegar cuando corresponda
- **physical**: elimina totalmente de la base de datos

```javascript
Model._delete(_id, type)
    .then((doc) => {
        // manipular doc
    })
    .catch((error) => {
        // logger error
    });
```

**Argumentos**:

- _id \(*ObjectId*\) **required**: ObjectId que identifica el documento a eliminar
- type \(*String*\): identifica el tipo de eliminación, default: **logical**

**Retorna**:

- \(*Promise*\): Retorna una promesa
    - then (doc): recibe como argumento el documento ya borrado en la base de datos, cuando es borrado lógicamente tiene los atributos **_deleteDate** y **_deleted**. Si doc es null es porque no se encontró para eliminar.
    - catch (error):
        - Errores estandarizados (internal)
        - Errores no controlados

#### _list

Listado de documentos

```javascript
Model._list(opts)
    .then(({docs, paginate}) => {
        // manipular docs
        // manipular paginate
    })
    .catch((error) => {
        // logger error
    });
```

**Argumentos**:

- opts \(*Object*\):
    - find \(*Object*\) **required**: opciones que permiten filtrar los documentos, mas info en [queries][mongoose-queries]
    - sort \(*Object/String*\): define que tipo () y por que atributos se va realizar el ordenamiento
    - select \(*Array/String*\): arreglo o string separado por espacio de atributos que se desean seleccionar del documento
    - paginate \(*Object*\):
        - page \(*Number*\): numero de pagina, default: 1
        - itemsPerPage \(*Number*\): documentos por pagina, default: 10
    - lean \(*Boolean*\): si esta activo los documentos obtenidos no posee los métodos, ya que se transforman a un objetos planos, por defecto: **true**
    - json \(*Boolean*\): si esta activo devuelve los documentos listos para entregarlos como json (la diferencia con lean es que se formatean las fechas a ISO), por defecto: **false**
    - trash \(*Boolean*\): si esta activo busca los elementos entre los eliminados lógicamente (papelera de documentos), por defecto: **false**
    - populate \(*Object/Array/String*\): necesario para poblar la información relacionada a otro documento, más info en [populate][mongoose-populate]

**Retorna**:

- \(*Promise*\): Retorna una promesa
    - then ({docs, paginate}): recibe como argumento los documentos (docs) de la base de datos y la paginación (paginate), en caso de setear la opts paginate como false se obtiene paginate = null y docs trae todos los documentos que cumplan con las opciones.
        - paginate \(*Object*\):
            - page \(*Number*\): numero de pagina
            - offset \(*Number*\): numero de elementos que se fueron saltados
            - total \(*Number*\): total de resultados
            - itemsPerPage \(*Number*\): elementos por pagina
            - pages \(*Number*\): numero de paginas
    - catch (error):
        - Errores estandarizados (internal)
        - Errores no controlados

#### _restore

Restaurar un elemento que esta eliminado lógicamente

```javascript
Model._restore(_id)
    .then((doc) => {
        // manipular doc
    })
    .catch((error) => {
        // logger error
    });
```

**Argumentos**:

- _id \(*ObjectId*\) **required**: ObjectId que identifica el documento

**Retorna**:

- \(*Promise*\): Retorna una promesa
    - then (doc): recibe como argumento el documento de la base de datos, ya restaurado (le quita el atributo **_deleteDate** y **_deleted**).
    - catch (error):
        - Errores estandarizados (internal)
        - Errores no controlados

### Grandes cantidades de data a actualizar, crear, eliminar (BULK)

Mongodb provee [Bulk operations][bulk-operation], las cuales permiten generar una secuencia de acciones a realizar (crear, eliminar, actualizar). Con el objetivo de poder utilizar esta funcionalidad y poder manipular gran cantidad de documentos de la manera mas optima para la base de datos se a creado el siguiente método

#### _merge

Este método provee una manera de manipular la información según los documentos que le estamos enviando, haciendo operaciones de conjunto y según las opciones que se le pasen genera el listado de los elementos a insertar, eliminar, actualizar

```javascript
Model._merge(opts)
    .then((result) => {
        // manipular result
    })
    .catch((error) => {
        // logger error
    });
```

**Argumentos**:

- opts \(*Object*\):
    - docs \(*Array*\) **required**: documentos sobre los cuales aplicar las operaciones de conjuntos, los elementos que están aquí y no en la base de datos se insertan, los que no están aquí y si en la base de datos se eliminan según el tipo de eliminación y los que están en ambos lados se actualizan según el tipo de actualización y priorizando los valores del documento de este arreglo
    - compare \(*Function/Array/String*\) **required**: aquí es donde ocurre la magia, porque depende de lo que este definido aquí, para que las operaciones de conjuntos sean correctas y no se inserte, elimine o actualice por error
    - find \(*Object*\): opciones que permiten filtrar los documentos a comparar, mas info en [queries][mongoose-queries]
    - insert \(*Object/Boolean*\): puede ser desactivado si es false, por defecto: **{}**
        - iterate \(*Function*\): permite poder validar o modificar el documento a insertar, ```iterate: (doc, insert) => doc``` siempre retornar el documento.
            - doc: documento pasado en **docs** (nuevo a insertar)
            - insert: todas las opciones pasadas a insert
    - update \(*Object*\):
        - type \(*String*\): al igual que el método **_update** de los modelos se debe especificar el tipo de actualización, por defecto: **patch**
        - iterate \(*Function*\): permite poder validar, comparar y modificar el documento versus el de la base de datos ```iterate: (doc, source, update) => doc``` siempre retornar el documento.
            - doc: documento pasado en **docs** (atributos a modificar)
            - source: documento actualmente en la base de datos
            - update: todas las opciones pasadas a update
    - remove \(*Object*\):
        - type \(*String*\): al igual que el método **_remove** de los modelos se debe especificar el tipo de eliminación, por defecto: **logical**

**Retorna**:

- \(*Promise*\): Retorna una promesa
    - then (result): recibe como argumento el resultado que es un diccionario donde las claves **insert**, **update** y **remove** contienen arreglos de los documentos en los cuales se realizo dicha acción
    - catch (error):
        - Errores estandarizados (internal)
        - Errores no controlados

## Pruebas funcionales (Unit Testing)

Se llevaron a cabo las pruebas funcionales para validar el funcionamiento de sus métodos y opciones por defecto:

```bash
$ yarn test
```

## Pruebas de rendimiento (Benchmark)

Con el objetivo de que sea optimo el código se realizaron 2 pruebas de rendimiento, de las cuales se determino que:

- La forma de recorrer arreglos mas eficiente, es con el for nativo ```for (let i = array.length - 1; i >= 0; i--) array[i]```

```bash
$ yarn benchmark benchmark/each.js

_.each x 7,918,522 ops/sec ±0.82% (86 runs sampled)
forEach x 7,718,545 ops/sec ±4.67% (82 runs sampled)
for of x 2,480,059 ops/sec ±1.01% (87 runs sampled)
for in x 2,101,375 ops/sec ±2.05% (87 runs sampled)
for -- x 35,529,313 ops/sec ±1.33% (87 runs sampled)
for ++ x 34,735,914 ops/sec ±1.46% (85 runs sampled)
Fastest is for --
```

- Para manejar de manera optima los conjuntos de documentos se determino que utilizar 2 for, slice y splite de array es mucho mas rápido que lodash o una clase con métodos o diccionarios.

```bash
$ yarn benchmark benchmark/set-lodash.js

_check x 229,626 ops/sec ±4.76% (83 runs sampled)
setCheck x 158,991 ops/sec ±15.98% (74 runs sampled)
forCheck x 626,663 ops/sec ±11.10% (86 runs sampled)
forCheckslice x 1,594,394 ops/sec ±0.95% (86 runs sampled)
Fastest is forCheckslice
```

## Changelog

Todos los cambios importantes son escritos aquí. El Formato esta basado en [Keep a Changelog](http://keepachangelog.com/es-ES/1.0.0/)

### [Unreleased]

### [1.0.0] - 2018-01-07
#### Added
- Se agrego la opción de definir los indices al momento de crear el modelo
- Se agregan pruebas funcionales con el objetivo de tener probado todo el código, usando [istanbul js][istanbul] para saber cuanto
- Manejo de relaciones entre documentos
- Atributos personalizados Available, LocalizableCountry y LocalizableString
- Método estático _merge, para realizar un volcado de grandes cantidades de documentos hacia la base de datos
- Registro de esquemas, con operaciones estáticas para realizar creación, actualización, listado, eliminado, restauración y detalle
- Modo debug para todas las consultas realizadas a través de mongoose
- README.md instalación, pruebas, uso y como contribuir al proyecto

#### Security
- Al crear y actualizar un documento no se deja modificar los atributos reservados (__v, _createDate, _updateDate, _deleteDate, _deleted)

[mongoose]: http://mongoosejs.com/
[mongoose-middleware]: http://mongoosejs.com/docs/middleware.html
[mongoose-schema]: http://mongoosejs.com/docs/guide.html
[mongoose-types]: http://mongoosejs.com/docs/schematypes.html
[mongoose-populate]: http://mongoosejs.com/docs/populate.html
[mongoose-populate]: http://mongoosejs.com/docs/populate.html
[mongoose-queries]: http://mongoosejs.com/docs/queries.html
[mongodb]: https://www.mongodb.com/
[mongodb-indexes]: https://docs.mongodb.com/v3.4/indexes/
[iso-countries]: https://www.iso.org/iso-3166-country-codes.html
[bulk-operation]: https://docs.mongodb.com/manual/reference/method/js-bulk/
[docs-mongoose]: http://mongoosejs.com/docs/guide.html
[istanbul]: https://istanbul.js.org/