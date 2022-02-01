import {
  createContext,
  createSignal,
  JSX,
  untrack,
  useContext,
} from 'solid-js';
import { Ref } from '../utils/types';
import useControlledSignal from '../utils/use-controlled-signal';
import { renderBody, RenderProp } from './utils';

type MultipleOptions<T> = {
  multiple: true;
  toggleable?: boolean;
  value?: T[];
  defaultValue?: T[];
  onChange?: (value?: T[]) => void;
  disabled?: boolean;
  CONTROLLED?: boolean;
}

type SingleOptions<T> = {
  multiple?: false;
  toggleable?: boolean;
  value?: T;
  defaultValue?: T;
  onChange?: (value?: T) => void;
  disabled?: boolean;
  CONTROLLED?: boolean;
}

type Options<T> =
  | SingleOptions<T>
  | MultipleOptions<T>

type Properties<T> = {
  isSelected(value: T): boolean;
  select(value: T): void;
  hasSelected(): boolean;
  isActive(value: T): boolean;
  hasActive(): boolean;
  focus(value: T): void;
  blur(): void;
  disabled(): boolean;
}

function useRoot<T>(
  options: Options<T>,
): Properties<T> {
  const [active, setActive] = createSignal<Ref<T>>();

  if (options.multiple) {
    const isControlled = 'CONTROLLED' in options ? options.CONTROLLED : 'value' in options;

    const [selectedValues, setSelectedValues] = useControlledSignal(
      options.defaultValue ?? [],
      isControlled ? () => options.value ?? [] : undefined,
      (value) => options.onChange?.(value ?? []),
    );

    return {
      isSelected: (value) => new Set(selectedValues()).has(value),
      select: (value) => {
        const set = new Set(untrack(selectedValues));
        (options.toggleable && set.has(value)) ? set.delete(value) : set.add(value);
        setSelectedValues([...set]);
      },
      hasSelected: () => selectedValues().length > 0,
      disabled: () => !!options.disabled,
      hasActive: () => !!active(),
      isActive: (value) => {
        const ref = active();
        return (ref)
          ? Object.is(value, ref.value)
          : false;
      },
      focus: (value) => setActive({ value }),
      blur: () => setActive(undefined),
    };
  }

  const isControlled = 'CONTROLLED' in options ? options.CONTROLLED : 'value' in options;

  const [selectedValue, setSelectedValue] = useControlledSignal(
    options.defaultValue ?? undefined,
    isControlled ? (() => options.value) : undefined,
    (value) => options.onChange?.(value),
  );

  return {
    isSelected: (value) => Object.is(value, selectedValue()),
    select: (value) => ((options.toggleable && Object.is(untrack(selectedValue), value))
      ? setSelectedValue(undefined)
      : setSelectedValue(value)),
    hasSelected: () => selectedValue() != null,
    disabled: () => !!options.disabled,
    hasActive: () => !!active(),
    isActive: (value) => {
      const ref = active();
      return (ref)
        ? Object.is(value, ref.value)
        : false;
    },
    focus: (value) => setActive({ value }),
    blur: () => setActive(undefined),
  };
}

const RootContext = createContext<Properties<unknown>>();

type RootRenderProp<T> = RenderProp<Properties<T>>;
export type RootProps<T> = { children?: RootRenderProp<T> | JSX.Element } & Options<T>

function Root<T>(props: RootProps<T>): JSX.Element {
  const properties = useRoot(props);
  return (
    <RootContext.Provider value={properties}>
      {(() => renderBody(props.children, properties))()}
    </RootContext.Provider>
  );
}

export function useChild<T>(): Properties<T> {
  const properties = useContext(RootContext);
  if (properties) return properties;
  throw new Error('`useChild` must be used within Root.');
}

type ChildRenderProp<T> = RenderProp<Properties<T>>
type ChildProps<T> = { children?: ChildRenderProp<T> | JSX.Element }

function Child<T>(props: ChildProps<T>): JSX.Element {
  const properties = useChild<T>();
  return renderBody(props.children, properties);
}

export {
  Child as HeadlessSelectChild,
  ChildProps as HeadlessSelectChildProps,
  ChildRenderProp as HeadlessSelectChildRenderProp,
  Options as HeadlessSelectOptions,
  Properties as HeadlessSelectProperties,
  Root as HeadlessSelectRoot,
  RootProps as HeadlessSelectRootProps,
  RootRenderProp as HeadlessSelectRootRenderProp,
  useRoot as useHeadlessSelect,
  useChild as useHeadlessSelectChild,
};

// eslint-disable-next-line import/no-cycle
export {
  HeadlessSelectOption,
  HeadlessSelectOptionChild,
  HeadlessSelectOptionChildProps,
  HeadlessSelectOptionProperties,
  HeadlessSelectOptionProps,
  HeadlessSelectOptionRenderProp,
  useHeadlessSelectOption,
  useHeadlessSelectOptionChild,
} from './Option';
