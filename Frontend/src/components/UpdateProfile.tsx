import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Mail, Phone} from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import { useUserStore } from "@/store/useUserStore";
import USER_DEFAULT_PROFILE_PIC from "@/assets/user_deault_profile_pic.png";
import { hasDataChanged } from "@/lib/utils";
import { ImagePreviewBox } from "./shared/utilityComponents";

const UpdateProfile = () => {
  const { user } = useUserStore();

  const [profileData, setProfileData] = useState({   
    fullName: user?.fullName || "",
    email: user?.email || "",
    contact: user?.contact || "",
    profilePic: null as File | null,
  });

  const imageRef = useRef<HTMLInputElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.profilePic || null
  );
  const [isChanged, setIsChanged] = useState<boolean>(false);

  const { updateProfile,loading } = useUserStore();

  
  function fileChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData((prev) => ({ ...prev, profilePic: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function inputChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    const { value, name } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  }

  async function updateProfileHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();

    for (const key in profileData) {
      const typedKey = key as keyof typeof profileData;
      const newValue = profileData[typedKey];
      const oldValue = user?.[typedKey];

      if (newValue !== oldValue) {
        if (typedKey === "profilePic") {
          if (newValue && newValue instanceof File) {
            formData.append(key, newValue);
          }
        } else {
          formData.append(key, newValue?.toString() || "");
        }
      }
    }
    await updateProfile(formData);
  }

  useEffect(() => {
    const result = hasDataChanged(profileData, user, "profilePic");
    setIsChanged(result);
  }, [profileData]);

  return (
    <form className="px-4 sm:p-0" onSubmit={updateProfileHandler}>
      <div className="flex gap-5 items-center">
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full">
          <ImagePreviewBox
            imageRef={imageRef}
            previewImage={previewImage}
            fallbackImage={user?.profilePic || USER_DEFAULT_PROFILE_PIC}
            className="rounded-full!"
          ></ImagePreviewBox>

          <input
            type="file"
            ref={imageRef}
            accept="image/*"
            onChange={fileChangeHandler}
            className="hidden"
          ></input>
        </div>

        <Input
          type="text"
          className="w-fit text-xl md:text-2xl font-semibold outline-none focus-visible:ring-transparent flex flex-col gap-4 rounded-sm p-2 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
          name="fullName"
          placeholder="username"
          value={profileData.fullName}
          onChange={inputChangeHandler}
        ></Input>
      </div>

      <div className="grid md:grid-cols-3 md:gap-5 gap-5 my-10">
        <div className="flex flex-col gap-4 rounded-sm p-2 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 border">
          <div className="text-gray-500 flex gap-4  items-center">
            <Mail></Mail>
            <Label>Email</Label>
          </div>
          <input
            type="text"
            className="pl-1 w-full bg-transparent border-none focus-visible:ring-0  focus-visible:border-transparent outline-none"
            name="email"
            placeholder="_________________"
            value={profileData.email}
            onChange={inputChangeHandler}
          />
        </div>
        <div className="flex flex-col gap-4 rounded-sm p-2 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 border">
          <div className="text-gray-500 flex gap-4  items-center">
            <Phone></Phone>
            <Label>Contact</Label>
          </div>
          <input
            type="tel"
            className="pl-1 w-full bg-transparent border-none focus-visible:ring-0  focus-visible:border-transparent outline-none"
            name="contact"
            placeholder="_________________"
            pattern="[0-9]{10}"
            value={profileData.contact}
            onChange={inputChangeHandler}
          />
        </div>
      </div>

      {loading.updateProfileBtn ? (
        <Button className="my-gradient-btn w-full max-w-45" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
          <span>Please wait</span>
        </Button>
      ) : (
        <Button
          disabled={!isChanged || loading.updateProfileBtn}
          type="submit"
          className="my-gradient-btn w-full max-w-45"
        >
          {isChanged ? "Save Changes" : "No Changes Detected"}
        </Button>
      )}
    </form>
  );
};

export default UpdateProfile;

