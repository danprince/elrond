aseprite := /Applications/Aseprite.app/Contents/MacOS/aseprite

.PHONY: sprites

sprites:
	$(aseprite) --batch sprites/font.aseprite --save-as src/assets/font.png
	$(aseprite) --batch sprites/ui.aseprite --list-slices --save-as src/assets/ui.png --data src/assets/ui.atlas
