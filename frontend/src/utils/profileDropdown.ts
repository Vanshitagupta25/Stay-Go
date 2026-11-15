export const PROFILE_MENU_HEADER_BOTTOM = 80;
export const PROFILE_MENU_GAP = 8;
export const PROFILE_MENU_EDGE_MARGIN = 12;
export const PROFILE_MENU_MIN_TOP =
  PROFILE_MENU_HEADER_BOTTOM + PROFILE_MENU_GAP;

export const getProfileDropdownPosition = (
  triggerRect: Pick<DOMRect, 'bottom' | 'right'>,
  viewportWidth: number,
) => ({
  top: Math.max(PROFILE_MENU_MIN_TOP, triggerRect.bottom + PROFILE_MENU_GAP),
  right: Math.max(PROFILE_MENU_EDGE_MARGIN, viewportWidth - triggerRect.right),
});
