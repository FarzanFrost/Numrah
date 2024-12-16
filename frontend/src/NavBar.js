import Logo from "./Logo"

const NavBar = () => {
    const rightText = 'Transform your ideas into Videos in a flash!!!'
    return (
      <nav className="navbar bg-dark px-3 m-1">
        <div className="container-fluid">
          <Logo />
          <span className="fs-5 text-end text-light">{rightText}</span>
        </div>
      </nav>
    );
  };
  
  export default NavBar;