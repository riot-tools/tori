import { register, mount } from 'riot';
// import sinon from 'sinon'

import ComponentName from './component.riot';

beforeAll(() => {
  register('component', ComponentName);
});

describe('Component', () => {
  let props = null,
    subject = null,
    wrapper = null;

  beforeEach(() => {
    subject = (customProps) => {
      props = {};

      const div = document.createElement('div');
      document.body.appendChild(div);
      return mount(div, { ...props, ...customProps }, 'component');
    };

    wrapper = subject();
  });

  test('renders without crashing', () => {
    expect(wrapper).toBeTruthy();
  });
});
