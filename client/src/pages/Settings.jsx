
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import useAdminSettings from '../hooks/useAdminSettings';
import useAdminTheme from '../hooks/useAdminTheme';
import SettingsForm from '../components/AdminSettings/SettingsForm';

const SettingsPage = () => {
	const {
		formData,
		profilePicture,
		defaultAvatarUrl,
		selectedFile,
		message,
		loading,
		picLoading,
		handleChange,
		handleFileChange,
		handleProfileUpdate,
		handlePictureUpload,
	} = useAdminSettings();

	const { theme, setTheme } = useAdminTheme();

	return (
		<AdminLayout>
			<SettingsForm
				theme={theme}
				formData={formData}
				profilePicture={profilePicture}
				defaultAvatarUrl={defaultAvatarUrl}
				selectedFile={selectedFile}
				message={message}
				loading={loading}
				picLoading={picLoading}
				handleChange={handleChange}
				handleFileChange={handleFileChange}
				handleSubmit={handleProfileUpdate}
				handlePictureUpload={handlePictureUpload}
				onThemeToggle={setTheme}
			/>
		</AdminLayout>
	);
};

export default SettingsPage;
