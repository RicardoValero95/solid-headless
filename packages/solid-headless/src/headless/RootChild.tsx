import { createContext, useContext } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import { renderBody, RenderProp } from './utils';

// TODO: This should be generic `createRootChild<T>`
// eslint-disable-next-line import/prefer-default-export
export function createRootChild<Properties, Options>(
  useRoot: (options: Options) => Properties,
) {
  const RootContext = createContext<Properties>();

  type RootRenderProp = RenderProp<Properties>
  type RootProps = { children?: RootRenderProp | JSX.Element } & Options

  function Root(props: RootProps): JSX.Element {
    const properties = useRoot(props);
    return (
      <RootContext.Provider value={properties}>
        {(() => renderBody(props.children, properties))()}
      </RootContext.Provider>
    );
  }

  function useChild(): Properties {
    const properties = useContext(RootContext);
    if (properties) return properties;
    throw new Error('`useChild` must be used within Root.');
  }

  type ChildRenderProp = RenderProp<Properties>
  type ChildProps = { children?: ChildRenderProp | JSX.Element }

  function Child(props: ChildProps): JSX.Element {
    const properties = useChild();
    const body = props.children;
    return renderBody(body, properties);
  }

  return {
    Root,
    useChild,
    Child,
  };
}
