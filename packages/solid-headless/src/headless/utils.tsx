import { JSX } from 'solid-js/jsx-runtime';

export type RenderProp<T> = ((properties: T) => JSX.Element)

export function isRenderProp<T>(
  children: T | JSX.Element,
): children is T {
  return typeof children === 'function' && children.length > 0;
}

export function renderBody<T>(body: RenderProp<T> | JSX.Element, properties: T): JSX.Element {
  return (isRenderProp(body))
    ? body(properties)
    : body;
}
