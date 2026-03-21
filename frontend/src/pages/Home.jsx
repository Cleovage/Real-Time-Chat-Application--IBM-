import { Link } from "react-router-dom";

function Home({ user }) {
  return (
    <div className="home">
      <section className="home-hero">
        <h1>Connect & Chat in Real-Time</h1>
        <p>
          Join chat rooms, send instant messages, and stay connected with your
          friends and team. Built with modern microservices architecture.
        </p>
        <div className="hero-buttons">
          {user ? (
            <>
              <Link to="/rooms" className="btn btn-primary">
                💬 Browse Rooms
              </Link>
              <Link to="/create-room" className="btn btn-secondary">
                ✨ Create Room
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                🚀 Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="home-features">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Real-Time Messaging</h3>
          <p>
            Send and receive messages instantly with Socket.IO powered
            real-time communication.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏠</div>
          <h3>Chat Rooms</h3>
          <p>
            Create public or private chat rooms and invite your friends to
            join the conversation.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure Authentication</h3>
          <p>
            JWT-based authentication ensures your account and messages are
            protected.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📧</div>
          <h3>Email Notifications</h3>
          <p>
            Get notified via email when important events happen in your chat
            rooms.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏗️</div>
          <h3>Microservices</h3>
          <p>
            Built with scalable microservices architecture — each service runs
            independently.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <h3>API Gateway</h3>
          <p>
            All requests flow through a centralized API Gateway for efficient
            routing and management.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
