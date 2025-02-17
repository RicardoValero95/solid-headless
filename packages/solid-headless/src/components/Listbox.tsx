import {
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  untrack,
  useContext,
  JSX,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import {
  omitProps,
} from 'solid-use';
import {
  HeadlessSelectChild,
  HeadlessSelectChildProps,
  HeadlessSelectOption,
  HeadlessSelectOptionProps,
  HeadlessSelectRoot,
  HeadlessSelectRootProps,
  useHeadlessSelectChild,
} from '../headless/Select';
import {
  createRef,
  DynamicNode,
  DynamicProps,
  ValidConstructor,
  WithRef,
} from '../utils/dynamic-prop';
import Fragment from '../utils/Fragment';
import {
  HeadlessDisclosureChild,
  HeadlessDisclosureChildProps,
  HeadlessDisclosureRoot,
  HeadlessDisclosureRootProps,
  useHeadlessDisclosureChild,
} from '../headless/Disclosure';
import {
  Button,
  ButtonProps,
} from './Button';
import { queryListboxOptions } from '../utils/query-nodes';

interface ListboxContext {
  horizontal?: boolean;
  multiple?: boolean;
  ownerID: string;
  labelID: string;
  buttonID: string;
  optionsID: string;
  hovering: boolean;
  anchor?: HTMLElement | null;
}

const ListboxContext = createContext<ListboxContext>();

function useListboxContext(componentName: string): ListboxContext {
  const context = useContext(ListboxContext);

  if (context) {
    return context;
  }
  throw new Error(`<${componentName}> must be used inside a <Listbox>`);
}

interface ListboxOptionsContext {
  setChecked: (node: Element) => void;
  setPrevChecked: (node: Element) => void;
  setNextChecked: (node: Element) => void;
  setFirstChecked: () => void;
  setLastChecked: () => void;
  setFirstMatch: (character: string) => void;
}

const ListboxOptionsContext = createContext<ListboxOptionsContext>();

function useListboxOptionsContext(componentName: string): ListboxOptionsContext {
  const context = useContext(ListboxOptionsContext);

  if (context) {
    return context;
  }
  throw new Error(`<${componentName}> must be used inside a <ListboxOptions>`);
}

interface ListboxMultipleProps<V> {
  multiple: true;
  onSelectChange?: (value: V[]) => void;
}

interface ListboxSingleProps<V> {
  multiple?: false;
  onSelectChange?: (value?: V) => void;
}

type ListboxBaseProps<V> =
  | ListboxMultipleProps<V>
  | ListboxSingleProps<V>;

export type ListboxProps<V, T extends ValidConstructor = typeof Fragment> = {
  as?: T;
  horizontal?: boolean;
  onDisclosureChange?: (value: boolean) => void;
} & ListboxBaseProps<V>
  & Omit<HeadlessSelectRootProps<V>, 'multiple' | 'children' | 'onChange' | 'CONTROLLED'>
  & Omit<HeadlessDisclosureRootProps, 'onChange' | 'CONTROLLED'>
  & Omit<DynamicProps<T>, keyof HeadlessDisclosureRootProps | keyof HeadlessSelectRootProps<V>>;

export function Listbox<V, T extends ValidConstructor = typeof Fragment>(
  props: ListboxProps<V, T>,
): JSX.Element {
  const [hovering, setHovering] = createSignal(false);
  const ownerID = createUniqueId();
  const labelID = createUniqueId();
  const buttonID = createUniqueId();
  const optionsID = createUniqueId();

  return (
    <ListboxContext.Provider
      value={{
        horizontal: props.horizontal,
        multiple: props.multiple,
        ownerID,
        labelID,
        buttonID,
        optionsID,
        get hovering() {
          return hovering();
        },
        set hovering(value: boolean) {
          setHovering(value);
        },
      }}
    >
      <Dynamic
        component={props.as ?? Fragment}
        {...omitProps(props, [
          'as',
          'children',
          'defaultOpen',
          'disabled',
          'horizontal',
          'isOpen',
          'multiple',
          'onDisclosureChange',
          'onSelectChange',
          'toggleable',
          'value',
          'defaultValue',
        ])}
        aria-labelledby={labelID}
        data-sh-listbox={ownerID}
        disabled={props.disabled}
        aria-disabled={props.disabled}
        data-sh-disabled={props.disabled}
      >
        <HeadlessSelectRoot<V>
          CONTROLLED={'value' in props}
          multiple={props.multiple}
          toggleable={props.toggleable}
          defaultValue={props.defaultValue}
          value={props.value}
          disabled={props.disabled}
          onChange={props.onSelectChange}
        >
          <HeadlessDisclosureRoot
            CONTROLLED={'isOpen' in props}
            isOpen={props.isOpen}
            defaultOpen={props.defaultOpen}
            disabled={props.disabled}
            onChange={props.onDisclosureChange}
          >
            {props.children}
          </HeadlessDisclosureRoot>
        </HeadlessSelectRoot>
      </Dynamic>
    </ListboxContext.Provider>
  );
}

export type ListboxLabelProps<T extends ValidConstructor = 'label'> = {
  as?: T;
}
  & HeadlessDisclosureChildProps
  & Omit<DynamicProps<T>, keyof HeadlessDisclosureChildProps>;

export function ListboxLabel<T extends ValidConstructor = 'label'>(
  props: ListboxLabelProps<T>,
): JSX.Element {
  const context = useListboxContext('ListboxLabel');

  return (
    <Dynamic
      component={props.as ?? 'label'}
      {...omitProps(props, [
        'as',
        'children',
      ])}
      id={context.labelID}
      data-sh-listbox-label={context.ownerID}
    >
      <HeadlessDisclosureChild>
        {props.children}
      </HeadlessDisclosureChild>
    </Dynamic>
  );
}

export type ListboxButtonProps<T extends ValidConstructor = 'button'> = {
  as?: T;
}
  & HeadlessDisclosureChildProps
  & WithRef<T>
  & Omit<DynamicProps<T>, keyof HeadlessDisclosureChildProps>;

export function ListboxButton<T extends ValidConstructor = 'button'>(
  props: ListboxButtonProps<T>,
): JSX.Element {
  const context = useListboxContext('ListboxButton');
  const properties = useHeadlessDisclosureChild();

  const [internalRef, setInternalRef] = createSignal<DynamicNode<T>>();

  createEffect(() => {
    const ref = internalRef();

    if (ref instanceof HTMLElement) {
      const toggle = () => {
        if (!(properties.disabled() || props.disabled)) {
          properties.setState(!properties.isOpen());
        }
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (!(properties.disabled() || props.disabled)) {
          switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
              e.preventDefault();
              toggle();
              break;
            default:
              break;
          }
        }
      };

      ref.addEventListener('click', toggle);
      ref.addEventListener('keydown', onKeyDown);

      onCleanup(() => {
        ref.removeEventListener('click', toggle);
        ref.removeEventListener('keydown', onKeyDown);
      });

      const onMouseEnter = () => {
        context.hovering = true;
      };
      const onMouseLeave = () => {
        context.hovering = false;
      };

      ref.addEventListener('mouseenter', onMouseEnter);
      ref.addEventListener('mouseleave', onMouseLeave);
      onCleanup(() => {
        ref.removeEventListener('mouseenter', onMouseEnter);
        ref.removeEventListener('mouseleave', onMouseLeave);
      });
    }
  });

  return (
    <Dynamic
      component={Button}
      {...omitProps(props, [
        'children',
        'ref',
      ])}
      id={context.buttonID}
      aria-haspopup="listbox"
      aria-expanded={properties.isOpen()}
      aria-controls={context.optionsID}
      aria-disabled={properties.disabled() || props.disabled}
      data-sh-expanded={properties.isOpen()}
      data-sh-disabled={properties.disabled() || props.disabled}
      disabled={properties.disabled() || props.disabled}
      ref={createRef(props, (e) => {
        setInternalRef(() => e);
        if (e instanceof HTMLElement) {
          context.anchor = e;
        }
      })}
      data-sh-listbox-button={context.ownerID}
    >
      <HeadlessDisclosureChild>
        {props.children}
      </HeadlessDisclosureChild>
    </Dynamic>
  );
}

export type ListboxOptionsProps<V, T extends ValidConstructor = 'ul'> = {
  as?: T;
}
  & HeadlessSelectChildProps<V>
  & WithRef<T>
  & Omit<DynamicProps<T>, keyof HeadlessSelectChildProps<V>>;

export function ListboxOptions<V, T extends ValidConstructor = 'ul'>(
  props: ListboxOptionsProps<V, T>,
): JSX.Element {
  const context = useListboxContext('ListboxOptions');
  const selectProperties = useHeadlessSelectChild();
  const properties = useHeadlessDisclosureChild();

  const [internalRef, setInternalRef] = createSignal<DynamicNode<T>>();

  function setChecked(node: Element) {
    (node as HTMLElement).focus();
  }

  function setNextChecked(node: Element) {
    const ref = internalRef();
    if (ref instanceof HTMLElement) {
      const options = queryListboxOptions(ref, context.ownerID);
      for (let i = 0, len = options.length; i < len; i += 1) {
        if (node === options[i]) {
          if (i === len - 1) {
            setChecked(options[0]);
          } else {
            setChecked(options[i + 1]);
          }
          break;
        }
      }
    }
  }

  function setPrevChecked(node: Element) {
    const ref = internalRef();
    if (ref instanceof HTMLElement) {
      const options = queryListboxOptions(ref, context.ownerID);
      for (let i = 0, len = options.length; i < len; i += 1) {
        if (node === options[i]) {
          if (i === 0) {
            setChecked(options[len - 1]);
          } else {
            setChecked(options[i - 1]);
          }
          break;
        }
      }
    }
  }

  function setFirstChecked() {
    const ref = internalRef();
    if (ref instanceof HTMLElement) {
      const options = queryListboxOptions(ref, context.ownerID);
      setChecked(options[0]);
    }
  }

  function setLastChecked() {
    const ref = internalRef();
    if (ref instanceof HTMLElement) {
      const options = queryListboxOptions(ref, context.ownerID);
      setChecked(options[options.length - 1]);
    }
  }

  function setFirstMatch(character: string) {
    const ref = internalRef();
    if (ref instanceof HTMLElement) {
      const options = queryListboxOptions(ref, context.ownerID);
      const lower = character.toLowerCase();
      for (let i = 0, l = options.length; i < l; i += 1) {
        if (options[i].textContent?.toLowerCase().startsWith(lower)) {
          setChecked(options[i]);
          return;
        }
      }
    }
  }

  createEffect(() => {
    if (!selectProperties.hasSelected()) {
      setFirstChecked();
    }
  });

  createEffect(() => {
    const ref = internalRef();
    if (ref instanceof HTMLElement) {
      const onBlur = (e: FocusEvent) => {
        if (context.hovering) {
          return;
        }
        if (!e.relatedTarget || !ref.contains(e.relatedTarget as Node)) {
          properties.setState(false);
        }
      };
      ref.addEventListener('focusout', onBlur);
      onCleanup(() => {
        ref.removeEventListener('focusout', onBlur);
      });
    }
  });

  return (
    <ListboxOptionsContext.Provider
      value={{
        setChecked,
        setFirstChecked,
        setLastChecked,
        setNextChecked,
        setPrevChecked,
        setFirstMatch,
      }}
    >
      <Dynamic
        component={props.as ?? 'ul'}
        {...omitProps(props, [
          'as',
          'children',
          'ref',
        ])}
        id={context.optionsID}
        role="listbox"
        disabled={properties.disabled() || props.disabled}
        aria-disabled={properties.disabled() || props.disabled}
        aria-multiselectable={context.multiple}
        aria-labelledby={context.buttonID}
        aria-orientation={context.horizontal ? 'horizontal' : 'vertical'}
        data-sh-listbox-options={context.ownerID}
        data-sh-disabled={properties.disabled() || props.disabled}
        tabindex={0}
        ref={createRef(props, (e) => {
          setInternalRef(() => e);
        })}
      >
        <HeadlessSelectChild>
          {props.children}
        </HeadlessSelectChild>
      </Dynamic>
    </ListboxOptionsContext.Provider>
  );
}

export type ListboxOptionProps<V, T extends ValidConstructor = 'li'> = {
  as?: T;
}
  & HeadlessSelectOptionProps<V>
  & WithRef<T>
  & Omit<ButtonProps<T>, keyof HeadlessSelectOptionProps<V>>;

export function ListboxOption<V, T extends ValidConstructor = 'li'>(
  props: ListboxOptionProps<V, T>,
): JSX.Element {
  const rootContext = useListboxContext('ListboxOptions');
  const context = useListboxOptionsContext('ListboxOptions');
  const disclosure = useHeadlessDisclosureChild();
  const properties = useHeadlessSelectChild();

  const [internalRef, setInternalRef] = createSignal<DynamicNode<T>>();

  let characters = '';
  let timeout: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  createEffect(() => {
    const ref = internalRef();

    if (ref instanceof HTMLElement) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (!(properties.disabled() || props.disabled)) {
          switch (e.key) {
            case 'ArrowLeft':
              if (rootContext.horizontal) {
                e.preventDefault();
                context.setPrevChecked(ref);
              }
              break;
            case 'ArrowUp':
              if (!rootContext.horizontal) {
                e.preventDefault();
                context.setPrevChecked(ref);
              }
              break;
            case 'ArrowRight':
              if (rootContext.horizontal) {
                e.preventDefault();
                context.setNextChecked(ref);
              }
              break;
            case 'ArrowDown':
              if (!rootContext.horizontal) {
                e.preventDefault();
                context.setNextChecked(ref);
              }
              break;
            case ' ':
            case 'Enter':
              if (ref.tagName === 'BUTTON') {
                e.preventDefault();
              }
              properties.select(props.value);
              if (!rootContext.multiple) {
                disclosure.setState(false);
              }
              break;
            case 'Home':
              e.preventDefault();
              context.setFirstChecked();
              break;
            case 'End':
              e.preventDefault();
              context.setLastChecked();
              break;
            default:
              if (e.key.length === 1) {
                characters = `${characters}${e.key}`;
                if (timeout) {
                  clearTimeout(timeout);
                }
                timeout = setTimeout(() => {
                  context.setFirstMatch(characters);
                  characters = '';
                }, 100);
              }
              break;
          }
        }
      };
      const onClick = () => {
        if (!(properties.disabled() || props.disabled)) {
          properties.select(props.value);
          if (!rootContext.multiple) {
            disclosure.setState(false);
          }
        }
      };
      const onFocus = () => {
        if (!(properties.disabled() || props.disabled)) {
          properties.focus(props.value);
        }
      };
      const onBlur = () => {
        if (!(properties.disabled() || props.disabled)) {
          properties.blur();
        }
      };

      ref.addEventListener('keydown', onKeyDown);
      ref.addEventListener('click', onClick);
      ref.addEventListener('focus', onFocus);
      ref.addEventListener('blur', onBlur);
      onCleanup(() => {
        ref.removeEventListener('keydown', onKeyDown);
        ref.removeEventListener('click', onClick);
        ref.removeEventListener('focus', onFocus);
        ref.removeEventListener('blur', onBlur);
      });
    }
  });

  createEffect(() => {
    const ref = internalRef();
    if (ref instanceof HTMLElement) {
      if (disclosure.isOpen()
        && untrack(() => properties.isSelected(props.value))
        && !(properties.disabled() || props.disabled)
      ) {
        ref.focus();
      }
    }
  });

  return (
    <Dynamic
      component={Button}
      as={props.as ?? 'li'}
      {...omitProps(props, [
        'as',
        'children',
        'value',
        'ref',
      ])}
      disabled={props.disabled}
      role="option"
      aria-disabled={props.disabled}
      aria-selected={properties.isSelected(props.value)}
      tabindex={-1}
      data-sh-listbox-option={rootContext.ownerID}
      data-sh-disabled={props.disabled}
      data-sh-selected={properties.isSelected(props.value)}
      ref={createRef(props, (e) => {
        setInternalRef(() => e);
      })}
    >
      <HeadlessSelectOption
        value={props.value}
        disabled={props.disabled}
      >
        {props.children}
      </HeadlessSelectOption>
    </Dynamic>
  );
}
