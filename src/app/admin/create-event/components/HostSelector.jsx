export default function HostSelector({ register, error, isAdmin, hostUsers }) {
  return (
    <div>
      <label
        htmlFor="host"
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        Email for Signup Notifications
      </label>
      {isAdmin ? (
        <>
          <input
            {...register("host")}
            type="email"
            list="host-suggestions"
            placeholder="Enter or select host email"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
          />
          <datalist id="host-suggestions">
            {hostUsers.map((user) => (
              <option key={user.email} value={user.email}>
                {"\u{1F464} "} {/* user icon emoji */}
                {user.name ? `${user.name} (${user.email})` : user.email}
              </option>
            ))}
          </datalist>
        </>
      ) : (
        <input
          {...register("host")}
          type="email"
          placeholder="Enter host email"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm sm:text-base"
        />
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}
