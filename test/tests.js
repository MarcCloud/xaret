import Rx from 'rxjs/Rx';
import Bacon from 'baconjs';
import * as Kefir from 'kefir';
//import * as most from 'most';
import xstream from 'xstream';
import * as React  from '../dist/xaret';
import { Component } from 'react';
import ReactDOM from 'react-dom/server';
import PropTypes from 'prop-types';

function show(x) {
    switch (typeof x) {
      case "string":
      case "object":
        return JSON.stringify(x)
      default:
        return `${x}`
    }
  }

const testRender = (vdom, expect) => it(`${expect}`, () => {
    const actual = ReactDOM.renderToStaticMarkup(vdom)
  
    if (actual !== expect)
      throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
});

describe('Basics', () => {
    testRender(<p key="k" ref={() => {}}>Hello</p>,
    '<p>Hello</p>');

    testRender(<p id={Rx.Observable.of("test")}>{null}</p>,
    '<p id="test"></p>');

    testRender(<p key="k" ref={() => {}}>{Rx.Observable.of("Hello")}</p>,
    '<p>Hello</p>');

    testRender(<p>{[Rx.Observable.of("Hello")]}</p>,
    '<p>Hello</p>');

    testRender(<p>Just testing <span>constants</span>.</p>,
        '<p>Just testing <span>constants</span>.</p>');

    testRender(<div onClick={() => {}}
        style={{display: "block",
                color: Rx.Observable.of('red'),
                background: "green"}}>
     <p>{Rx.Observable.of(["Hello"])}</p>
     <p>{Rx.Observable.of(["World"])}</p>
   </div>,
   '<div style="display:block;color:red;background:green"><p>Hello</p><p>World</p></div>');

    testRender(<a href="#lol" style={Rx.Observable.of({color:'red'})} >
                {Rx.Observable.of("Hello")} {Rx.Observable.of('world!')}
              </a>,
              '<a href="#lol" style="color:red">Hello world!</a>');
    testRender(<div>{Rx.Observable.of(0).delay(1000)}</div>, "")
    testRender(<div>{Rx.Observable.of(1).merge(Rx.Observable.of(0).delay(1000))}</div>, "<div>1</div>")
    testRender(<div>{Rx.Observable.of(0).delay(1000)} {Rx.Observable.of(0)}</div>, "")
    
    const Custom = ({ prop, ...props }) => <div>{`${prop} ${JSON.stringify(props)}`}</div>

    testRender(<Custom prop={Rx.Observable.of('not-lifted')} ref="test" />,
      '<div>[object Object] {}</div>')
    testRender(<Custom xaret-lift prop={Rx.Observable.of('lifted')} ref="test" />,
      '<div>lifted {}</div>')
    testRender(<Custom xaret-lift prop={'lifted anyway'} ref="test" />,
      '<div>lifted anyway {}</div>')
      
    const Spread = props => <div {...props} />

    testRender(<Spread>
                Hello {Rx.Observable.of("world!")}
              </Spread>,
      '<div>Hello world!</div>')
    testRender(<div><div>a</div>{[<div key="b">b</div>, [<div key="c">c</div>, [<div key="d">d</div>]]]}</div>,
      '<div><div>a</div><div>b</div><div>c</div><div>d</div></div>')
    
    testRender(<div><div>a</div>{[<div key="b">b</div>, Rx.Observable.of([<div key="c">c</div>, [<div key="d">d</div>]])]}</div>,
      '<div><div>a</div><div>b</div><div>c</div><div>d</div></div>')

    const ChildrenWithSibling = ({ children }) => <div>Test: {children}</div>

    testRender(<ChildrenWithSibling>
                Hello {Rx.Observable.of('world!')}
              </ChildrenWithSibling>,
      '<div>Test: Hello world!</div>')
})

describe("fromObservable", () => {
  testRender(React.fromObservable(Rx.Observable.of(<p>Yes</p>)), '<p>Yes</p>')
})

describe("fromClass", () => {
  const P = React.fromClass("p")
  testRender(<P $$ref={() => { }}>Hello</P>, '<p>Hello</p>')

  testRender(<P>Hello, {"world"}!</P>, '<p>Hello, world!</p>')
  testRender(<P ref={() => { }}>Hello, {Rx.Observable.of("world")}!</P>, '<p>Hello, world!</p>')

  testRender(<P>{[Rx.Observable.of("Hello")]}</P>,
    '<p>Hello</p>')

  testRender(<P>{Rx.Observable.of(0).delay(1000)}</P>, "")
})

describe("context", () => {
  class Context extends Component {
    constructor(props) {
      super(props)
    }
    getChildContext() {
      return this.props.context
    }
    render() {
      return <div>{this.props.children}</div>
    }
  }
  Context.childContextTypes = { message: PropTypes.any }

  const Bottom = (_, context) => <div>{Rx.Observable.of('Bottom')} {context.message}</div>
  Bottom.contextTypes = { message: PropTypes.any }

  const Middle = () => <div>{Rx.Observable.of('Middle')} <Bottom /></div>
  const Top = () => <div>{Rx.Observable.of('Top')} <Middle /></div>

  testRender(<Context context={{ message: Rx.Observable.of('Hello') }}><Top /></Context>,
    "<div><div>Top <div>Middle <div>Bottom Hello</div></div></div></div>")
})

describe("Works with ES Observable", () => {
  const WithBacon = () => <span>{Bacon.constant('Delicious bacon...').toESObservable()}</span>
  testRender(<WithBacon />, "<span>Delicious bacon...</span>");

  const WithKefir = () => <span>{Kefir.constant('Sweet kefir...').toESObservable()}</span>
  testRender(<WithKefir />, "<span>Sweet kefir...</span>");
  //TODO: Research more on how to work with mostjs
  // const WithMost = () => <span>{most.just('Get the most of this...')}</span>
  // testRender(<WithMost />, "<span>Get the most of this...</span>");

  const Xtreme = () => <span>{xstream.of('Xstream component...')}</span>
  testRender(<Xtreme />, "<span>Xstream component...</span>")
});