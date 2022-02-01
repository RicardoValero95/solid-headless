import { JSX } from 'solid-js';
import useControlledSignal from '../utils/use-controlled-signal';
import { RenderProp } from './utils';
import { createRootChild } from './RootChild';

export type Options = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (state?: boolean) => void;
  disabled?: boolean;
  CONTROLLED?: boolean;
}

export type Properties = {
  checked(): boolean | undefined;
  setState(newState?: boolean): void;
  disabled(): boolean;
}

export function useRoot(
  options: Options = {},
): Properties {
  const isControlled = 'CONTROLLED' in options ? options.CONTROLLED : 'checked' in options;

  const [signal, setSignal] = useControlledSignal(
    options.defaultChecked,
    isControlled ? () => options.checked : undefined,
    (value) => options.onChange?.(value),
  );

  return {
    checked: () => signal(),
    setState(value) {
      if (!options.disabled) {
        setSignal(value);
        options.onChange?.(value);
      }
    },
    disabled: () => !!options.disabled,
  };
}

export const { Root, useChild, Child } = createRootChild(useRoot);

// TODO: How to extract these types from createRootChild?
export type RootRenderProp = RenderProp<Properties>
export type RootProps = Options & { children?: RootRenderProp | JSX.Element }
export type ChildRenderProp = RenderProp<Properties>
export type ChildProps = { children?: ChildRenderProp | JSX.Element }

export {
  Child as HeadlessToggleChild,
  ChildProps as HeadlessToggleChildProps,
  ChildRenderProp as HeadlessToggleChildRenderProp,
  Options as HeadlessToggleOptions,
  Properties as HeadlessToggleProperties,
  Root as HeadlessToggleRoot,
  RootProps as HeadlessToggleRootProps,
  RootRenderProp as HeadlessToggleRootRenderProp,
  useRoot as useHeadlessToggle,
  useChild as useHeadlessToggleChild,
};
