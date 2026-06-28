import { useUser, useSignOut } from "@gadgetinc/react";
import reactLogo from "../assets/react-logo.svg";
import { api } from "../api";
import userIcon from "../assets/default-user-icon.svg";
import { Link } from "react-router-dom";

export default function () {
  const user = useUser(api);
  const signOut = useSignOut();

  return user ? (
    <>
      <div className="app-link">
        <img src={reactLogo} className="app-logo" alt="logo" />
        <span>You are now signed into {process.env.GADGET_PUBLIC_APP_SLUG} </span>
      </div>
      <div>
        <p className="description" style={{ width: "100%" }}>
          Start building your app&apos;s signed in area
        </p>
        <a href="/edit/files/frontend/routes/signed-in.jsx" target="_blank" rel="noreferrer" style={{ fontWeight: 500 }}>
          frontend/routes/signed-in.jsx
        </a>
      </div>
      <div className="card-stack">
        <div className="card user-card">
          <div className="card-content">
            <img className="icon" src={user.googleImageUrl ?? userIcon}/>
            <div className="userData">
              <p>id: {user.id}</p>
              <p>
                name: {user.firstName} {user.lastName}
              </p>
              <p>
                email: <a href={`mailto:${user.email}`}>{user.email}</a>
              </p>
              <p>created: {user.createdAt.toString()}</p>
            </div>
          </div>
          <div className="sm-description">This data is fetched from the user model</div>
        </div>
        <div className="card" style={{ padding: "1rem" }}>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>Link Discord &amp; osu!</h3>
          <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem" }}>
            Connect your Discord account to retrieve your linked osu! profile.
            This will allow the app to track your osu! stats. Click the button
            below to start the account-linking flow securely through our server.
          </p>
          <a
            href="/start-discord-link"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "#5865F2",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Link Discord and osu!
          </a>
        </div>
        <div className="flex-vertical gap-4px">
          <strong>Actions:</strong>
          <Link to="/change-password">Change password</Link>
          <a onClick={signOut}>
            Sign Out
          </a>
        </div>
      </div>
    </>
  ) : null;
}