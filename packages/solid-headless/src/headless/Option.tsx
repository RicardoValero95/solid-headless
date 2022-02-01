import { createContext, JSX, useContext } from 'solid-js';
import { renderBody } from './utils';
import { useChild as useParent } from './Select';

type Options<T> = {
    value: T,
    disabled?: boolean
}

type Properties = {
  isSelected(): boolean;
  select(): void;
  isActive(): boolean;
  focus(): void;
  blur(): void;
  disabled(): boolean;
}

function useRoot<T>(
//   options: Options<T>,
  value: () => T,
  disabled?: () => boolean,
): Properties {
  const properties = useParent<T>();
  //   const { disabled, value } = options();
  const isDisabled = () => disabled?.() || properties.disabled();
  return {
    isSelected: () => properties.isSelected(value()),
    isActive: () => properties.isActive(value()),
    select: () => ((!isDisabled())
      ? properties.select(value()) : {}),
    focus: () => ((!isDisabled())
      ? properties.focus(value()) : {}),
    blur() {
      if (!isDisabled() && this.isActive()) {
        properties.blur();
      }
    },
    disabled: isDisabled,
  };
}

type RenderProp = ((properties: Properties) => JSX.Element);

const RootContext = createContext<Properties>();

export type RootProps<T> = { children?: RenderProp | JSX.Element } & Options<T>

// export interface RootProps<T> {
//   value: T;
//   disabled?: boolean,
//   children?: RenderProp | JSX.Element;
// }

function Root<T>(
  props: RootProps<T>,
): JSX.Element {
//   const properties = useRoot(props);
  const properties = useRoot(
    () => props.value,
    () => !!props.disabled,
  );
  return (
    <RootContext.Provider value={properties}>
      {(() => renderBody(props.children, properties))()}
    </RootContext.Provider>
  );
}

function useChild(): Properties {
  const properties = useContext(RootContext);
  if (properties) return properties;
  throw new Error('`useChild` must be used within Root');
}

type ChildProps = { children?: RenderProp | JSX.Element }

function Child(
  props: ChildProps,
): JSX.Element {
  const properties = useChild();
  return renderBody(props.children, properties);
}

export {
  Root as HeadlessSelectOption,
  Child as HeadlessSelectOptionChild,
  ChildProps as HeadlessSelectOptionChildProps,
  Properties as HeadlessSelectOptionProperties,
  RootProps as HeadlessSelectOptionProps,
  RenderProp as HeadlessSelectOptionRenderProp,
  useRoot as useHeadlessSelectOption,
  useChild as useHeadlessSelectOptionChild,
};
