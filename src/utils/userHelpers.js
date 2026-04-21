export const getUserDisplayName = (user, fallback = 'User') => {
    if (!user) return fallback;

    return (
        user.fullName ||
        user.displayName ||
        user.name ||
        user.email?.split('@')?.[0] ||
        fallback
    );
};

export const getUserInitial = (user, fallback = 'U') => {
    const displayName = getUserDisplayName(user, fallback);
    return displayName.charAt(0).toUpperCase();
};
