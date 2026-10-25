import { fireEvent, render, screen } from '@testing-library/svelte';
import type { ComponentProps } from 'svelte';
import { vi } from 'vitest';
import { getIntersectionObserverMock } from '$lib/__mocks__/intersection-observer.mock';
import { personFactory } from '@test-data/factories/person-factory';
import PeoplePage from './+page.svelte';
import PeoplePageTestWrapper from './PeoplePage.test-wrapper.svelte';

vi.mock(import('$lib/managers/feature-flags-manager.svelte'), function () {
  return {
    featureFlagsManager: { init: vi.fn(), loadFeatureFlags: vi.fn(), value: {} } as never,
  };
});

vi.mock('$lib/components/layouts/UserPageLayout.svelte', async () => {
  return await import('@test-data/mocks/UserPageLayout.mock.svelte');
});

vi.mock('@immich/sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@immich/sdk')>()),
  getClusterGroupUsers: vi.fn().mockResolvedValue([]),
}));

const getData = (): ComponentProps<typeof PeoplePage>['data'] => ({
  error: undefined,
  meta: { title: 'People' },
  asset: undefined,
  filter: {},
  people: {
    people: [personFactory.build({ id: 'a', name: '', isHidden: false })],
    total: 1,
    hidden: 0,
    hasNextPage: false,
  },
});

describe('People page', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', getIntersectionObserverMock());
  });

  it('does not blur the name input when Enter confirms an IME composition', async () => {
    render(PeoplePageTestWrapper, { data: getData() });
    const input = await screen.findByPlaceholderText('add_a_name');
    input.focus();

    await fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(document.activeElement).toBe(input);

    await fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    expect(document.activeElement).toBe(input);
  });

  it('blurs the name input on a plain Enter', async () => {
    render(PeoplePageTestWrapper, { data: getData() });
    const input = await screen.findByPlaceholderText('add_a_name');
    input.focus();

    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(document.activeElement).not.toBe(input);
  });
});
