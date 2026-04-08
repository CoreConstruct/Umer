import os
import requests

BASE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb"
SAVE_DIR = "public/assets/images/alphabet"

images = {
    "A":"7/77/ASL_A.svg/120px-ASL_A.svg.png",
    "B":"8/8a/ASL_B.svg/120px-ASL_B.svg.png",
    "C":"c/c0/ASL_C.svg/120px-ASL_C.svg.png",
    "D":"d/d1/ASL_D.svg/120px-ASL_D.svg.png",
    "E":"a/a4/ASL_E.svg/120px-ASL_E.svg.png",
    "F":"8/87/ASL_F.svg/120px-ASL_F.svg.png",
    "G":"4/4e/ASL_G.svg/120px-ASL_G.svg.png",
    "H":"2/26/ASL_H.svg/120px-ASL_H.svg.png",
    "I":"6/6d/ASL_I.svg/120px-ASL_I.svg.png",
    "J":"b/b2/ASL_J.svg/120px-ASL_J.svg.png",
    "K":"1/16/ASL_K.svg/120px-ASL_K.svg.png",
    "L":"9/9d/ASL_L.svg/120px-ASL_L.svg.png",
    "M":"1/15/ASL_M.svg/120px-ASL_M.svg.png",
    "N":"a/a2/ASL_N.svg/120px-ASL_N.svg.png",
    "O":"8/89/ASL_O.svg/120px-ASL_O.svg.png",
    "P":"1/1b/ASL_P.svg/120px-ASL_P.svg.png",
    "Q":"a/a8/ASL_Q.svg/120px-ASL_Q.svg.png",
    "R":"1/16/ASL_R.svg/120px-ASL_R.svg.png",
    "S":"5/59/ASL_S.svg/120px-ASL_S.svg.png",
    "T":"8/8e/ASL_T.svg/120px-ASL_T.svg.png",
    "U":"a/a6/ASL_U.svg/120px-ASL_U.svg.png",
    "V":"3/35/ASL_V.svg/120px-ASL_V.svg.png",
    "W":"f/f5/ASL_W.svg/120px-ASL_W.svg.png",
    "X":"d/d3/ASL_X.svg/120px-ASL_X.svg.png",
    "Y":"1/17/ASL_Y.svg/120px-ASL_Y.svg.png",
    "Z":"d/d4/ASL_Z.svg/120px-ASL_Z.svg.png",
}

os.makedirs(SAVE_DIR, exist_ok=True)

for letter, path in images.items():
    url = f"{BASE_URL}/{path}"
    save_path = os.path.join(SAVE_DIR, f"{letter}.png")

    try:
        print(f"Downloading {letter}...")
        img_data = requests.get(url).content
        with open(save_path, 'wb') as f:
            f.write(img_data)
    except Exception as e:
        print(f"Failed {letter}: {e}")

print("✅ Done bro!")