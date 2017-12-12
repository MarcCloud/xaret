[ [≡](#contents) | [Contrived Example](#example) | [Reference](#reference) ]

# Xaret

Xaret is a library that allows you to
embed [RxJS](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html) observables
into [React](https://facebook.github.io/react/) Virtual DOM.  Embedding
observables into VDOM has the following benefits:
* It allows you to use
  only
  [functional components](https://facebook.github.io/react/docs/components-and-props.html#functional-and-class-components),
  because you can then use observables for managing state
  and [`ref`](https://facebook.github.io/react/docs/refs-and-the-dom.html) for
  component lifetime, leading to more **_concise code_**.
* It helps you to use React in an **_algorithmically efficient_** way:
  * The body of a functional component is evaluated only once each time the
    component is mounted.
    * This also helps you to avoid issues such as
      the
      [gotcha with ref](https://facebook.github.io/react/docs/refs-and-the-dom.html#caveats).
  * Only elements that contain embedded observables are rerendered when changes
    are pushed through observables.  An update to a deeply nested VDOM element
    can be an O(1) operation.

Using Xaret couldn't be simpler.  You just `import * as React from "xaret"` and
you are good to go.

[![npm version](https://badge.fury.io/js/xaret.svg)](https://badge.fury.io/js/xaret)

## Contents

* [Contrived Example](#example)
* [Reference](#reference)
  * [`xaret-lift` attribute](#xaret-lift)
  * [`fromObservable(observableVDOM)`](#fromObservable "fromObservable: Observable VDOM -> VDOM")
  * [`fromClass(Component)`](#fromClass "fromClass: Component props -> Component (Observable props)")
    * [`$$ref` attribute](#ref)

## Contrived Example

To use Xaret, you simply import it as `React`:

```jsx
import * as React from "xaret"
```

and you can then write React components:

```jsx
const oncePerSecond$ = Rx.Observable.interval(1000)

const Clock = () =>
  <div>
    The time is {oncePerSecond$.map(() => new Date().toString())}.
  </div>
```
[![Edit nwmo5r1lj](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/nwmo5r1lj)

with VDOM that can have embedded [Rx.Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html)
observables.  This works because Xaret exports an enhanced version of
`createElement`.

**NOTE:** Xaret does not pass through other named React exports.  Only
`createElement` is exported, which is all that is needed for basic use of VDOM
or the Babel JSX transform.

**NOTE:** The result, like the `Clock` above, is *just* a React component.  If
you export it, you can use it just like any other React component and even in
modules that do not import `xaret`.



## Reference

### <a name="xaret-lift"></a> [≡](#contents) [`xaret-lift` attribute](#xaret-lift)

Xaret only lifts built-in HTML elements implicitly.  The `xaret-lift` attribute
on a non-primitive element instructs Xaret to lift the element.

For example, you could write:

```jsx
import * as RR    from "react-router"
import * as React from "xaret"

const Link1 = ({...props}) => <RR.Link xaret-lift {...props}/>
```

to be able to use `Link1` with
embedded [Rx.Observable](https://github.com/tc39/proposal-observable) observables:

```jsx
<Link1 href="https://www.youtube.com/watch?v=Rbm6GXllBiw"
       ref={elem => elem && elem.focus()}>
  {Rx.Observable.from([3, 2, 1, "Boom!"], Rx.Observable.interval(1000))}
</Link1>
```

Note that the `ref` attribute is only there as an example to contrast
with [`$$ref`](#ref).

### <a name="fromObservable"></a> [≡](#contents) [`fromObservable(observableVDOM)`](#fromObservable "fromObservable: Observable VDOM -> VDOM")

`fromObservable` allows one to convert a Kefir observable of React elements into a
React element.  It is useful in case the top-most element of a component depends
on a Kefir observable.

For example:

```jsx
import {fromObservable} from "xaret"

const Chosen = ({choice}) =>
  fromObservable(Rx.Observable.fromPromise(fetch('//api/json')).map(result => <div>{result}</div>))
```

Note that the point of using `fromObservable` in the above example is that we don't
want to wrap the Rx.Observable.fromPromise(...) inside an additional element like this:

```jsx
const Chosen = ({choice}) =>
  <div>
    {Rx.Observable.fromPromise(fetch('//api/json')).map(result => <div>{result}</div>)}
  </div>
```

### <a name="fromClass"></a> [≡](#contents) [`fromClass(Component)`](#fromClass "fromClass: Component props -> Component (Observable props)")

`fromClass` allows one to lift a React component.

For example:

```jsx
import * as RR from "react-router"
import {fromClass} from "xaret"

const Link2 = fromClass(RR.Link)
```

**WARNING:** A difficulty with lifting components is that you will then need to
use the [`$$ref`](#ref) attribute, which is not necessary when
using [`xaret-lift`](#xaret-lift) to lift an element.

#### <a name="ref"></a> [≡](#contents) [`$$ref` attribute](#ref)

The `$$ref` attribute on an element whose component is lifted using `fromClass`

```jsx
<Link2 href="https://www.youtube.com/watch?v=Rbm6GXllBiw"
       $$ref={elem => elem && elem.focus()}>
  {Rx.Observable.from([3, 2, 1, "Boom!"], Rx.Observable.interval(1000))}
</Link2>
```

does the same thing as the ordinary
JSX
[`ref` attribute](https://facebook.github.io/react/docs/more-about-refs.html#the-ref-callback-attribute):
JSX/React treats `ref` as a special case and it is not passed to components, so
a special name had to be introduced for it.

## Previous Work

`xaret.js` is a port of [`karet`](https://github.com/calmm-js/karet) to to use RxJS instead of Kefir for embeding observables into React components. This library is based and isnpired by the work of [@polytypic](https://github.com/polytypic) and [@fiatjaf](https://github.com/fiatjaf).

Read more about React Combinator at [Calmm-js](https://github.com/calmm-js).


## Tutorials

coming soon...