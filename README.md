# OC-Passwords
A web extension to access your owncloud passwords and create new ones.

Replaces the old [ff-oc-passwords](https://github.com/eglia/ff-oc-passwords) from Eglia.

Supports Chrome and FireFox browsers. Also tested on Vivaldi. But should work on browsers based on chrome like Opera.

Published in [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/owncloud-passwords-client/), but not in the chrome store.


## Changes from original add-on:
* Includes a search function. Clicking on the url, open the link in a new tab
* Ability to copy into clipboard both, users and passwords. After 10 seconds, clipboard is cleared. On firefox, is replaced with a blank space: ' '
* Shortcut Ctrl+Shift+F to open the interface
* Create new passwords (no login detection)

## Changelog (Not all versions are released):
### 1.92
	Fixed: On hover the last password for current site, appeared ugly and unnecessary scrollbars

### 1.91
	New: Make text (search results) not selectable
	New: Added feedback when new password is created/uploaded
	Fixed: Bottom icons won't disappear. Added scrollbars for current url passwords (more than 10 matches) and search results (at least 4 will be visible, but usually 10)
	Fixed: Issues with focus when switching between Search/Fill view and New Password
	Fixed: Import url button don't store Site in memory and went lost after closing the interface
	Fixed: Remember password didn't store the password and couldn't reconnect
	Fixed: Added a delay on startup before retrieving passwords

### 1.90
	Fixed: When a new password is created, check it against current tab
	New: Link to open a new tab with owncloud server
	New: New icons

### 1.89
	Fixed: When Url is copied into Site, remove "www."
	New: Keep last view (search/fill view or new password)

### 1.88
	New: New password site is filled with website's domain
	Fixed: On new password creation, url wasn't stored if the button import was used
	Fixed: "Import" button not working properly. Url was gather only when a new tab was selected and not when url changed

### 1.86
	New: Categories can be assigned to new passwords (only visible if you have categories)
	Fixed: Notifications wasn't working on Firefox

### 1.85
	Small internal improvements

### 1.84
	New password form keeps the data when the interface is closed
	Added button to get the current url

### 1.83
	Create new passwords from the plugin

### 1.82
	Bug fixed

### 1.81
	Added button to logout
	Added option to logout after user defined idle time (popup not used)

### 1.80
	Remove search after a link is open

### 1.79
	Reset icon to grey when browser starts