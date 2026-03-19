"use client";
import React, { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { splitName, useAuthUser } from "../../hooks/useAuthUser";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";


export default function UserMetaCard() {
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
  const socialLinks = [
    { label: "Skype", value: skypeProfile },
    { label: "Telegram", value: telegramProfile },
    { label: "Facebook", value: facebookProfile },
    { label: "X", value: xProfile },
    { label: "YouTube", value: youtubeProfile },
    { label: "Instagram", value: instagramProfile },
  ]
    .filter((link) => link.value)
    .map((link) => ({
      ...link,
      href:
        link.value?.startsWith("http://") ||
        link.value?.startsWith("https://") ||
        link.value?.startsWith("skype:") ||
        link.value?.startsWith("tg:")
          ? link.value
          : null,
    }));

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

      if (avatarFile) {
        formData.set("avatar", avatarFile);
      }

      const response = await fetch("/api/v1/profile", {
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
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={profileAvatar}
                alt="user"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.name ?? "User"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Team Manager
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Arizona, United States
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {socialLinks.length > 0 ? (
                socialLinks.map((socialLink) => (
                  socialLink.href ? (
                    <a
                      key={socialLink.label}
                      target="_blank"
                      rel="noreferrer"
                      href={socialLink.href}
                      className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                      {socialLink.label}
                    </a>
                  ) : (
                    <span
                      key={socialLink.label}
                      className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {socialLink.label}
                    </span>
                  )
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No social profiles added yet.</p>
              )}
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
    </>
  );
}
