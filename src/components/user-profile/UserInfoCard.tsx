"use client";

import { ENV } from "@/config/env";
import React, { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { splitName, useAuthUser } from "../../hooks/useAuthUser";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useAuthUser();
  const { firstName, lastName } = splitName(user?.name);
  const email = user?.email ?? "";
  const skypeProfile = user?.skype_profile ?? "";
  const telegramProfile = user?.telegram_profile ?? "";
  const facebookProfile = user?.facebook_profile ?? "";
  const xProfile = user?.x_profile ?? "";
  const youtubeProfile = user?.youtube_profile ?? "";
  const instagramProfile = user?.instagram_profile ?? "";
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const profileAvatar = useMemo(() => {
    return avatarPreview ?? user?.avatar_url ?? "/images/user/owner.jpg";
  }, [avatarPreview, user?.avatar_url]);

  const getAuthToken = (): string | null => {
    const localToken = localStorage.getItem("auth_token");

    if (localToken) {
      return localToken;
    }

    const sessionToken = sessionStorage.getItem("auth_token");

    if (sessionToken) {
      return sessionToken;
    }

    const authCookie = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("auth_token="));

    if (!authCookie) {
      return null;
    }

    const [, cookieValue = ""] = authCookie.split("=");
    return decodeURIComponent(cookieValue);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0] ?? null;
    setAvatarFile(selectedFile);

    if (!selectedFile) {
      setAvatarPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setAvatarPreview(previewUrl);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const token = getAuthToken();

    if (!token) {
      setFormError("You are not authenticated.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const apiBaseUrl = ENV.API_BASE_URL;

      if (avatarFile) {
        formData.set("avatar", avatarFile);
      }

      const response = await fetch(`${apiBaseUrl}/api/v1/profile`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            data?: {
              user?: {
                avatar_url?: string | null;
                skype_profile?: string | null;
                telegram_profile?: string | null;
                facebook_profile?: string | null;
                x_profile?: string | null;
                youtube_profile?: string | null;
                instagram_profile?: string | null;
              };
            };
          }
        | null;

      if (!response.ok) {
        setFormError(payload?.message ?? "Unable to save profile changes.");
        return;
      }

      if (payload?.data?.user?.avatar_url) {
        setAvatarPreview(payload.data.user.avatar_url);
      } else {
        setAvatarPreview(null);
      }

      window.dispatchEvent(new Event("profile-updated"));
      closeModal();
    } catch {
      setFormError("Unable to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {firstName || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {lastName || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {email || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Skype
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {skypeProfile || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Telegram
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {telegramProfile || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Facebook
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {facebookProfile || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                X
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {xProfile || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                YouTube
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {youtubeProfile || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Instagram
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {instagramProfile || "-"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {formError ? (
                <p className="mb-4 text-sm text-error-500">{formError}</p>
              ) : null}

              <div className="mb-7">
                <Label>Avatar</Label>
                <div className="mt-3 flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
                    <img
                      src={profileAvatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    name="avatar"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600 dark:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input
                      key={`first-name-${firstName}`}
                      name="first_name"
                      type="text"
                      defaultValue={firstName}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input
                      key={`last-name-${lastName}`}
                      name="last_name"
                      type="text"
                      defaultValue={lastName}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input
                      key={`email-${email}`}
                      name="email"
                      type="email"
                      defaultValue={email}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Skype</Label>
                    <Input
                      key={`skype-profile-${skypeProfile}`}
                      name="skype_profile"
                      type="text"
                      defaultValue={skypeProfile}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Telegram</Label>
                    <Input
                      key={`telegram-profile-${telegramProfile}`}
                      name="telegram_profile"
                      type="text"
                      defaultValue={telegramProfile}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Facebook</Label>
                    <Input
                      key={`facebook-profile-${facebookProfile}`}
                      name="facebook_profile"
                      type="text"
                      defaultValue={facebookProfile}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>X</Label>
                    <Input
                      key={`x-profile-${xProfile}`}
                      name="x_profile"
                      type="text"
                      defaultValue={xProfile}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>YouTube</Label>
                    <Input
                      key={`youtube-profile-${youtubeProfile}`}
                      name="youtube_profile"
                      type="text"
                      defaultValue={youtubeProfile}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Instagram</Label>
                    <Input
                      key={`instagram-profile-${instagramProfile}`}
                      name="instagram_profile"
                      type="text"
                      defaultValue={instagramProfile}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
