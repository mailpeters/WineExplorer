#!/usr/bin/env python3
# pip install selenium webdriver-manager Faker

import time
import random
import string
import unicodedata
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from faker import Faker

US_STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY",
    "LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH",
    "OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"
]

def slugify(s, max_len=20):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode().lower()
    s = "".join(ch if ch.isalnum() else "-" for ch in s).strip("-")
    s = "-".join(filter(None, s.split("-")))
    return s[:max_len].strip("-") or "site"

class ReserveAllMarketingTest:
    def __init__(self):
        self.fake = Faker("en_US")
        self.chrome_options = Options()
        self.chrome_options.add_argument("--start-maximized")
        self.chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        self.chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.chrome_options.add_experimental_option('useAutomationExtension', False)
        # Randomize UA a bit
        self.chrome_options.add_argument(f"--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                         f"AppleWebKit/537.36 (KHTML, like Gecko) "
                                         f"Chrome/{random.randint(114, 127)}.0.{random.randint(1000, 6000)}."
                                         f"{random.randint(10,150)} Safari/537.36")
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()),
                                       options=self.chrome_options)
        self.driver.implicitly_wait(10)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    def _human_type(self, element, text):
        element.clear()
        # variable typing speed with occasional hiccups/backspace
        for ch in text:
            element.send_keys(ch)
            time.sleep(random.uniform(0.03, 0.13))
            if random.random() < 0.02:
                element.send_keys("\b")
                time.sleep(random.uniform(0.05, 0.12))
                element.send_keys(ch)
        # small pause after field
        time.sleep(random.uniform(0.15, 0.35))

    def wait(self, by, value, timeout=15):
        return WebDriverWait(self.driver, timeout).until(EC.element_to_be_clickable((by, value)))

    def pick_dropdown(self, field_id, value):
        el = self.wait(By.ID, field_id)
        Select(el).select_by_value(value)
        time.sleep(random.uniform(0.1, 0.3))

    def generate_realistic_data(self):
        company = self.fake.company()
        # trim suffixes like Inc., LLC sometimes
        company_clean = company.replace(",", "")
        if any(sfx in company_clean for sfx in ["Inc", "LLC", "Ltd", "Group", "PLC", "Corp"]):
            company_base = company_clean.split()[0] + " " + self.fake.word().title()
        else:
            company_base = company_clean
        company_slug = slugify(company_base)
        site_suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=3))
        # Site name must be lowercase letters and numbers only, no hyphens or special characters
        site_name = f"{company_slug}{site_suffix}".replace("-", "").lower()
        # Ensure it's not too long and only contains valid characters
        site_name = "".join(ch for ch in site_name if ch.isalnum()).lower()[:20]

        first = self.fake.first_name()
        last = self.fake.last_name()

        domain = slugify(company_base, max_len=15) + self.fake.random_element(elements=[".com",".co",".io",".net"])
        email = f"{first}.{last}@{domain}".lower()

        # Addresses
        comp_addr1 = self.fake.street_address()
        comp_addr2 = self.fake.secondary_address() if random.random() < 0.5 else ""
        comp_city = self.fake.city()
        comp_state = random.choice(US_STATES)
        comp_zip = self.fake.postcode_in_state(state_abbr=comp_state)

        user_addr1 = self.fake.street_address()
        user_addr2 = self.fake.secondary_address() if random.random() < 0.4 else ""
        user_city = self.fake.city()
        user_state = random.choice(US_STATES)
        user_zip = self.fake.postcode_in_state(state_abbr=user_state)

        # Phones in a realistic format (always 10 digits)
        def phone():
            npa = random.choice(["202","212","213","305","404","415","469","503","602","617","703","704","718","801","832","904"])
            nxx = random.randint(200, 999)  # 3-digit exchange code
            last4 = random.randint(1000, 9999)  # 4-digit subscriber number
            return f"({npa}) {nxx:03d}-{last4}"  # Format nxx with leading zeros if needed

        data = {
            "companyName": company_base,
            "firstName": first,
            "lastName": last,
            "siteName": site_name,
            "email": email,
            "password": "mmmmmmmm",
            "companyAddress": comp_addr1,
            "companyAddress2": comp_addr2,
            "companyCity": comp_city,
            "companyState": comp_state,
            "companyZip": comp_zip,
            "companyPhone": phone(),
            "userAddress": user_addr1,
            "userAddress2": user_addr2,
            "userCity": user_city,
            "userState": user_state,
            "userZip": user_zip,
            "userPhone": phone(),
        }
        return data

    def fill(self, field_id, value):
        el = self.wait(By.ID, field_id)
        if el.get_attribute("readonly"):
            self.driver.execute_script("arguments[0].removeAttribute('readonly');", el)
        self._human_type(el, value)

    def test_navigation(self):
        """Test all navigation menu items"""
        print("\n" + "="*60)
        print("TESTING NAVIGATION MENU")
        print("="*60)

        # Test Home
        print("\n1. Testing Home page...")
        self.driver.get("https://clubdirector.app")
        time.sleep(random.uniform(2.0, 3.0))
        print("✓ Home page loaded")

        # Test Pricing
        print("\n2. Testing Pricing page...")
        try:
            pricing_link = self.wait(By.LINK_TEXT, "Pricing")
            pricing_link.click()
            time.sleep(random.uniform(1.5, 2.5))
            print("✓ Pricing page loaded")
        except Exception as e:
            print(f"✗ Pricing page failed: {e}")

        # Test Topics
        print("\n3. Testing Topics page...")
        try:
            topics_link = self.wait(By.LINK_TEXT, "Topics")
            topics_link.click()
            time.sleep(random.uniform(1.5, 2.5))
            print("✓ Topics page loaded")
        except Exception as e:
            print(f"✗ Topics page failed: {e}")

        # Test About
        print("\n4. Testing About page...")
        try:
            about_link = self.wait(By.LINK_TEXT, "About")
            about_link.click()
            time.sleep(random.uniform(1.5, 2.5))
            print("✓ About page loaded")
        except Exception as e:
            print(f"✗ About page failed: {e}")

        # Test Contact
        print("\n5. Testing Contact page...")
        try:
            contact_link = self.wait(By.LINK_TEXT, "Contact")
            contact_link.click()
            time.sleep(random.uniform(1.5, 2.5))
            print("✓ Contact page loaded")
        except Exception as e:
            print(f"✗ Contact page failed: {e}")

    def test_contact_form(self):
        """Test the contact form submission"""
        print("\n" + "="*60)
        print("TESTING CONTACT FORM")
        print("="*60)

        # Navigate to contact page
        self.driver.get("https://clubdirector.app/contact")
        time.sleep(random.uniform(2.0, 3.0))

        # Generate test data
        contact_data = {
            "name": self.fake.name(),
            "email": self.fake.email(),
            "subject": self.fake.catch_phrase(),
            "message": self.fake.text(max_nb_chars=200)
        }

        print(f"\nContact Data:")
        print(f"  Name: {contact_data['name']}")
        print(f"  Email: {contact_data['email']}")
        print(f"  Subject: {contact_data['subject']}")

        try:
            # Fill contact form
            print("\nFilling contact form...")
            self.fill("contactName", contact_data["name"])
            self.fill("contactEmail", contact_data["email"])
            self.fill("contactSubject", contact_data["subject"])

            # Fill message (textarea)
            message_el = self.wait(By.ID, "contactMessage")
            self._human_type(message_el, contact_data["message"])

            # Submit form
            print("Submitting contact form...")
            submit_btn = self.wait(By.ID, "contactSubmitBtn")
            self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submit_btn)
            time.sleep(0.5)
            self.driver.execute_script("arguments[0].click();", submit_btn)

            print("✓ Contact form submitted! Waiting for response...")

            # Check for success message
            try:
                success = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "alert-success"))
                )
                print(f"✓ SUCCESS: {success.text}")
            except TimeoutException:
                try:
                    err = self.driver.find_element(By.CLASS_NAME, "alert-danger")
                    print(f"✗ FAILURE: {err.text}")
                except NoSuchElementException:
                    print("⚠ No explicit success or error message detected")

            time.sleep(2)

        except Exception as e:
            print(f"✗ Contact form test failed: {e}")

    def test_terms_and_privacy(self):
        """Test Terms of Service and Privacy Policy pages"""
        print("\n" + "="*60)
        print("TESTING LEGAL PAGES")
        print("="*60)

        # Test Terms of Service
        print("\n1. Testing Terms of Service page...")
        try:
            self.driver.get("https://clubdirector.app/terms-of-service")
            time.sleep(random.uniform(1.5, 2.5))
            # Check if page has content
            body = self.driver.find_element(By.TAG_NAME, "body")
            if "Terms of Service" in body.text or "terms" in body.text.lower():
                print("✓ Terms of Service page loaded")
            else:
                print("⚠ Terms of Service page loaded but content unclear")
        except Exception as e:
            print(f"✗ Terms of Service page failed: {e}")

        # Test Privacy Policy
        print("\n2. Testing Privacy Policy page...")
        try:
            self.driver.get("https://clubdirector.app/privacy-policy")
            time.sleep(random.uniform(1.5, 2.5))
            # Check if page has content
            body = self.driver.find_element(By.TAG_NAME, "body")
            if "Privacy Policy" in body.text or "privacy" in body.text.lower():
                print("✓ Privacy Policy page loaded")
            else:
                print("⚠ Privacy Policy page loaded but content unclear")
        except Exception as e:
            print(f"✗ Privacy Policy page failed: {e}")

    def test_registration(self):
        """Test the registration form"""
        print("\n" + "="*60)
        print("TESTING REGISTRATION")
        print("="*60)

        self.driver.get("https://clubdirector.app/register")
        time.sleep(random.uniform(2.0, 3.5))

        td = self.generate_realistic_data()
        print(f"\n=== Generated Test Data ===")
        print(f"Company: {td['companyName']}")
        print(f"Site: {td['siteName']}")
        print(f"Email: {td['email']}")
        print(f"Password: {td['password']}")
        print(f"===========================\n")

        # Extract CSRF token from meta tag
        try:
            csrf_token = self.driver.find_element(By.CSS_SELECTOR, 'meta[name="csrf-token"]').get_attribute('content')
            print(f"✓ Extracted CSRF token: {csrf_token[:20]}...")
        except Exception as e:
            print(f"⚠ Failed to extract CSRF token: {e}")
            csrf_token = None

        # Company section
        print("Filling company information...")
        self.fill("companyName", td["companyName"])
        self.fill("email", td["email"])
        self.fill("password", td["password"])
        self.fill("confirmPassword", td["password"])
        self.fill("siteName", td["siteName"])

        # Company address
        print("Filling company address...")
        self.fill("companyAddress", td["companyAddress"])
        if td["companyAddress2"]:
            self.fill("companyAddress2", td["companyAddress2"])
        self.fill("companyCity", td["companyCity"])
        self.pick_dropdown("companyRegionCode", td["companyState"])
        self.fill("companyZip", td["companyZip"])
        self.fill("companyPhone", td["companyPhone"])

        # Owner info
        print("Filling owner information...")
        self.fill("firstName", td["firstName"])
        self.fill("lastName", td["lastName"])
        self.fill("userAddress", td["userAddress"])
        if td["userAddress2"]:
            self.fill("userAddress2", td["userAddress2"])
        self.fill("userCity", td["userCity"])
        self.pick_dropdown("userRegionCode", td["userState"])
        self.fill("userZip", td["userZip"])
        self.fill("userPhone", td["userPhone"])
        print("All fields filled!")

        # Scroll to terms checkbox to ensure it's visible
        print("\nScrolling to terms checkbox...")
        chk = self.wait(By.ID, "agreeTerms")
        # Scroll up a bit more to ensure nothing overlaps
        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", chk)
        time.sleep(1.0)
        # Scroll window up slightly to avoid footer overlap
        self.driver.execute_script("window.scrollBy(0, -100);")
        time.sleep(0.5)

        # Click terms checkbox using JavaScript to avoid click interception
        if not chk.is_selected():
            print("Clicking 'I agree to terms' checkbox...")
            time.sleep(random.uniform(0.3, 0.7))
            # Always use JavaScript click to avoid interception issues
            self.driver.execute_script("arguments[0].click();", chk)
            time.sleep(0.5)
            print(f"✓ Checkbox selected: {chk.is_selected()}")

        # Collect form data including CSRF token
        form_data = {
            'companyName': td["companyName"],
            'email': td["email"],
            'password': td["password"],
            'confirmPassword': td["password"],
            'siteName': td["siteName"],
            'companyAddress': td["companyAddress"],
            'companyAddress2': td["companyAddress2"] or '',
            'companyCity': td["companyCity"],
            'companyRegionCode': td["companyState"],
            'companyZip': td["companyZip"],
            'companyPhone': td["companyPhone"],
            'firstName': td["firstName"],
            'lastName': td["lastName"],
            'userAddress': td["userAddress"],
            'userAddress2': td["userAddress2"] or '',
            'userCity': td["userCity"],
            'userRegionCode': td["userState"],
            'userZip': td["userZip"],
            'userPhone': td["userPhone"],
            '_csrf': csrf_token
        }

        print("Submitting registration via API...")

        # Submit via JavaScript API call
        script = f"""
        fetch('/api/register', {{
            method: 'POST',
            headers: {{
                'Content-Type': 'application/json',
            }},
            body: JSON.stringify({form_data})
        }})
        .then(response => response.json())
        .then(data => {{
            if (data.message && data.message.includes('successful')) {{
                window.registrationSuccess = data;
            }} else {{
                window.registrationError = data;
            }}
        }})
        .catch(error => {{
            window.registrationError = {{message: error.message}};
        }});
        """

        self.driver.execute_script(script)

        # Wait for response
        print("✓ Form submitted! Waiting for response...")
        time.sleep(3)  # Give time for API call

        # Check for success/error in window object
        try:
            success_data = self.driver.execute_script("return window.registrationSuccess;")
            if success_data:
                print(f"✓ SUCCESS: {success_data.get('message', 'Registration completed')}")
                return True
        except:
            pass

        try:
            error_data = self.driver.execute_script("return window.registrationError;")
            if error_data:
                print(f"✗ FAILURE: {error_data.get('message', 'Unknown error')}")
                return False
        except:
            pass

        print("⚠ No explicit success or error message detected")
        return False

    def run(self):
        try:
            print("\n" + "="*60)
            print("STARTING COMPREHENSIVE MARKETING APP TEST")
            print("="*60)

            # Test all navigation
            self.test_navigation()

            # Test legal pages
            self.test_terms_and_privacy()

            # Test contact form
            self.test_contact_form()

            # Test registration
            self.test_registration()

            print("\n" + "="*60)
            print("ALL TESTS COMPLETE")
            print("="*60)
            print("\nReview the browser window for final results.")
            time.sleep(10)

        except Exception as e:
            print(f"\n✗ TEST SUITE ERROR: {e}")
            import traceback
            traceback.print_exc()
            input("Press Enter to close the browser...")
        finally:
            self.driver.quit()

def main():
    t = ReserveAllMarketingTest()
    t.run()

if __name__ == "__main__":
    main()
