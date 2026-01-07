from PIL import Image

sprite_sheet_path = "pokemonicons-sheet.png"  # Replace with your image file
sprite_sheet = Image.open(sprite_sheet_path)
# sprite_sheet.show()

# width, height = sprite_sheet.size
# total_pixels = width * height
# print(f"The image has a width of {width} pixels and a height of {height} pixels.")
# print(f"The total pixel count of the image is: {total_pixels}")



def save_sprites():
    sprite_width = 40
    sprite_height = 30
    num_columns = 12
    # num_rows = 10
    # num_rows = 136
    num_rows = 107


    sprites = []
    dex_num = 0
    for row in range(num_rows):
        for col in range(num_columns):
            # Calculate the top-left corner coordinates of the current sprite
            left = col * sprite_width
            top = row * sprite_height
            
            # Calculate the bottom-right corner coordinates
            right = left + sprite_width
            bottom = top + sprite_height
            
            # Crop the sprite
            sprite = sprite_sheet.crop((left, top, right, bottom))
            sprites.append(sprite)
            
            sprite.save(f"sprites/{dex_num}.png")
            dex_num += 1

def find_forms(start, end):
    for i in range(start, end):
        active = Image.open(f"sprites/{i}.png")
        active.show()


save_sprites()
# find_forms(1100,1110)