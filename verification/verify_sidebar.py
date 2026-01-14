
from playwright.sync_api import sync_playwright

def verify_sidebar_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop context
        context_desktop = browser.new_context(viewport={'width': 1280, 'height': 720})
        page_desktop = context_desktop.new_page()

        print("Navigating to home page (Desktop)...")
        page_desktop.goto("http://localhost:3000")
        page_desktop.wait_for_load_state("networkidle")

        # Verify initial state (Expanded)
        # Sidebar should be 260px wide
        # Main content should be ml-260px

        print("Taking screenshot of initial state...")
        page_desktop.screenshot(path="verification/desktop_initial.png")

        # Collapse Sidebar
        print("Collapsing sidebar...")
        # The menu button is the one with the Menu icon
        # In Sidebar.tsx: <button onClick={toggleSidebar} ...>{isMobile ? <X size={20} /> : <Menu size={20} />}</button>
        # We can find it by looking for the button inside the sidebar header that is not the 'New Chat' button.
        # It's the only button in the header div.

        # We use a more generic selector if lucide classes aren't reliable (though they should be)
        # We can try selecting by the structure: button in the header div (flex items-center justify-between)
        # But let's check page source or just trust lucide class names usually work if they are SVG classes.
        # Wait, lucide-react renders SVGs with class "lucide lucide-menu".
        # Let's try locating by SVG.

        try:
            page_desktop.locator("button svg.lucide-menu").click()
            page_desktop.wait_for_timeout(500) # Wait for animation
            print("Taking screenshot of collapsed state...")
            page_desktop.screenshot(path="verification/desktop_collapsed.png")
        except Exception as e:
            print(f"Failed to click desktop sidebar toggle: {e}")
            page_desktop.screenshot(path="verification/desktop_error.png")

        context_desktop.close()

        # Mobile Context
        context_mobile = browser.new_context(viewport={'width': 375, 'height': 667})
        page_mobile = context_mobile.new_page()

        print("Navigating to home page (Mobile)...")
        page_mobile.goto("http://localhost:3000")
        page_mobile.wait_for_load_state("networkidle")

        print("Taking screenshot of mobile initial state...")
        page_mobile.screenshot(path="verification/mobile_initial.png")

        # Open Sidebar
        print("Opening mobile sidebar...")
        # The trigger is in the mobile header: <button onClick={() => setMobileOpen(true)} ...><MoreVertical size={20} /></button>
        # Note: lucide-more-vertical

        try:
             # Wait for the button to be visible
            page_mobile.wait_for_selector("button svg.lucide-more-vertical", state="visible")
            page_mobile.locator("button svg.lucide-more-vertical").click()
            page_mobile.wait_for_timeout(500)

            print("Taking screenshot of mobile sidebar open...")
            page_mobile.screenshot(path="verification/mobile_sidebar_open.png")
        except Exception as e:
            print(f"Failed to click mobile sidebar trigger: {e}")
            page_mobile.screenshot(path="verification/mobile_error.png")


        context_mobile.close()
        browser.close()

if __name__ == "__main__":
    verify_sidebar_layout()
