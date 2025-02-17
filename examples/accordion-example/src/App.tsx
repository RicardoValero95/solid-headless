import {
  Accordion,
  AccordionButton,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from 'solid-headless';
import { For, JSX } from 'solid-js';

function ChevronUpIcon(props: JSX.IntrinsicElements['svg']): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
}

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'Magic Conch Shell, will I ever get married?',
    answer: 'Maybe someday.',
  },
  {
    question: 'Oh, Magic Conch Shell, what do we need to do to get out of the Kelp Forest?',
    answer: 'Nothing.',
  },
  {
    question: 'Uh, hello there. Magic Conch, uh, I was wondering... uh, should I have the spaghetti or the turkey?',
    answer: 'Neither.',
  },
  {
    question: 'Oh, then how about the soup?',
    answer: 'I don\'t think so.',
  },
  {
    question: 'Could I have anything to eat?',
    answer: 'No.',
  },
];

export default function App(): JSX.Element {
  return (
    <div class="w-full">
      <div class="w-full max-w-md p-2 mx-auto bg-white rounded-2xl">
        <Accordion<FAQ | undefined> toggleable>
          <For each={FAQS}>
            {(faq) => (
              <AccordionItem value={faq} class="mt-2">
                <AccordionHeader>
                  <AccordionButton
                    as="div"
                    class="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
                  >
                    {({ isSelected }) => (
                      <>
                        <span>{faq.question}</span>
                        <ChevronUpIcon
                          class={`${isSelected() ? 'transform rotate-180' : ''} w-5 h-5 text-purple-500`}
                        />
                      </>
                    )}
                  </AccordionButton>
                </AccordionHeader>
                <AccordionPanel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            )}
          </For>
        </Accordion>
      </div>
    </div>
  );
}
