import Rx from 'rxjs/Rx';
import * as React from '../dist/xaret.cjs';
//import { Component } from 'react';
import ReactDOM from 'react-dom/server';
//import PropTypes from 'prop-types';

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

   testRender(<a href="#lol" style={Rx.Observable.of({color: "red"})}>
                {Rx.Observable.of("Hello")} {Rx.Observable.of("world!")}
                </a>,
                '<a href="#lol" style="color:red">Hello world!</a>')
})