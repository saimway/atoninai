from playwright.sync_api import Page, expect, sync_playwright

def verify_slash_menu(page: Page):
    print("Navigating to home...")
    page.goto("http://localhost:3000")

    # Wait for the textarea to be visible
    print("Waiting for input...")
    textarea = page.locator('textarea')
    expect(textarea).to_be_visible()

    # Type '/'
    print("Typing /...")
    textarea.fill("/")

    # Wait for menu
    print("Waiting for menu...")
    # The menu has text "/clear", "/settings", etc.
    # We can look for text "/clear"
    clear_option = page.get_by_text("/clear")
    expect(clear_option).to_be_visible()

    print("Taking screenshot...")
    page.screenshot(path="verification_slash_menu.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_slash_menu(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
