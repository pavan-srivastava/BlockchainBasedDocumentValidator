import React from "react";
import { Component } from "react";
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';


class Header extends Component {
  render ()
  {
    return (
      <div >
        <AppBar position="static">
          <Toolbar>
            <Typography  variant="display2" color="inherit" >
              Document Validator
          </Typography>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}
export default Header;
