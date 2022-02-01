import { JSX } from 'solid-js/jsx-runtime';
import useControlledSignal from '../utils/use-controlled-signal';
import { RenderProp } from './utils';
import { createRootChild } from './RootChild';

type Options = {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onChange?: (state: boolean) => void;
  disabled?: boolean;
  CONTROLLED?: boolean;
}

type Properties = {
  isOpen(): boolean;
  setState(newState: boolean): void;
  disabled(): boolean;
}

function useRoot(
  options: Options = {},
): Properties {
  const isControlled = 'CONTROLLED' in options ? options.CONTROLLED : 'isOpen' in options;

  const [signal, setSignal] = useControlledSignal(
    !!options.defaultOpen,
    isControlled ? () => !!options.isOpen : undefined,
    (value) => options.onChange?.(value),
  );

  return {
    isOpen: () => signal(),
    setState: (value) => ((!options.disabled)
      ? setSignal(value)
      : {}),
    disabled: () => !!options.disabled,
  };
}

const { Root, useChild, Child } = createRootChild(useRoot);

// TODO: How to extract these types from createRootChild?
type RootRenderProp = RenderProp<Properties>
type RootProps = { children?: RootRenderProp | JSX.Element } & Options
type ChildRenderProp = RenderProp<Properties>
type ChildProps = { children?: ChildRenderProp | JSX.Element }

export {
  Child as HeadlessDisclosureChild,
  ChildProps as HeadlessDisclosureChildProps,
  ChildRenderProp as HeadlessDisclosureChildRenderProp,
  Options as HeadlessDisclosureOptions,
  Properties as HeadlessDisclosureProperties,
  Root as HeadlessDisclosureRoot,
  RootProps as HeadlessDisclosureRootProps,
  RootRenderProp as HeadlessDisclosureRootRenderProp,
  useRoot as useHeadlessDisclosure,
  useChild as useHeadlessDisclosureChild,
};
