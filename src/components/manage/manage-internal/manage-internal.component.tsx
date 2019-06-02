import * as React from 'react';
import DropdownItem from 'react-bootstrap/DropdownItem';
import { Link } from 'react-router-dom';
import { Dropdown, DropdownMenu, DropdownToggle, Table, Input, Button } from 'reactstrap';
import { ICognitoUser, cognitoRoles } from '../../../model/cognito-user.model';
import ViewUserModal from '../view-user-modal/view-user-modal.container';
import { IManageInternalComponentProps } from './manage-internal.container';
//import Label from 'reactstrap/lib/Label';

/**
 * {v}: dropdown with further info
 * #: hoverable props
 * [... ]: button
 * 
 * `Row headers:
 * |-----------\|---------------------\|-------------\|----------\
 * |--'Admins'--|--'Staging Managers'--|--'Trainers'--|--Cohorts--|                              [*+ ]
 * [ *********************************************************************************************** ]
 * [--Cohort.Name--|--Address.alias{v}--|--Token.(){v}-- |--StartMonth--|--trainer email-v--         ]
 * [=================================================================================================|
 * [  1901-blake   |  USF               | [Get token  v] | March 2019   | [blake.kruppa@gmail.com v] |
 * [-------------------------------------------------------------------------------------------------|
 * [  1902-flake   |  Reston            | [Get token  v] | March 2019   | [flake@gmail.com v       ] |
 * [-------------------------------------------------------------------------------------------------|
 * [  1903-fake    |  USF               | [Get token  v] | March 2019   | [abatson@gmail.com v     ] |
 * [-------------------------------------------------------------------------------------------------|
 * [  1904-bake    |  Reston            | [Get token  v] | March 2019   | [fllorida.man@gmail.com v] |
 * [-------------------------------------------------------------------------------------------------|
 * [  1905-make    |  USF               | [Get token  v] | March 2019   | [blake.kruppa@gmail.com v] |
 * [ *********************************************************************************************** |
 *                                                                         [p1 ] [p2 ] ... [p4 ] [p5 ]                
 * `
 * {
 *   Cohort # {
 *     cohortDescription,
 *   }
 * 
 * }
 */

interface ManageInternalState {
    roleDropdownList: boolean;
    selectedRole: string;
}

export class ManageInternalComponenet extends React.Component<IManageInternalComponentProps, ManageInternalState> {

    constructor(props: IManageInternalComponentProps) {
        super(props);
        this.state = {
            roleDropdownList: false,
            selectedRole: ''
        };
    }
    componentDidMount() {
        this.props.updateManageUsersTable("all", '', this.props.manageUsers.manageUsersCurrentPage);

    }
    displayUserModal = async (selectedUser: ICognitoUser) => {
        await this.props.selectUserForDisplay(selectedUser);
        this.props.toggleViewUserModal();
    }

    toggleDropdownList = () => {
        this.setState({
            roleDropdownList: !this.state.roleDropdownList
        });
    }
    updateDropdown = (option: string, page: number) => {
        console.log('test')
        this.props.updateManageUsersTable(option, this.props.manageUsers.emailSearch, page);
        this.props.updateSearchOption(option);
    }

    getUserByEmail = (page: number) => {
        this.props.updateManageUsersTable('All', this.props.manageUsers.emailSearch, page);
    }

    updateValueOfSearchEmail = (e: React.FormEvent) => {
        const target = e.target as HTMLSelectElement;
        this.props.updateSearchEmail(target.value);
    }

    incrementPage = () => {
        if (this.props.manageUsers.manageUsersCurrentPage < this.props.manageUsers.manageUsersPageTotal - 1) {
            const newPage = this.props.manageUsers.manageUsersCurrentPage + 1;
            if (this.props.manageUsers.emailSearch) {
                this.getUserByEmail(newPage);
            } else {
                this.updateDropdown(this.props.manageUsers.option, newPage);
            }
        }
    }

    decrementPage = () => {
        if (this.props.manageUsers.manageUsersCurrentPage > 0) {
            const newPage = this.props.manageUsers.manageUsersCurrentPage - 1;
            if (this.props.manageUsers.emailSearch) {
                this.getUserByEmail(newPage);
            } else {
                this.updateDropdown(this.props.manageUsers.option, newPage);
            }
        }
    }


    // returns active if the role provided in the route is the routeName provided
    isActive = (routeName: string) => ((this.state.selectedRole === routeName) ? 'manage-user-nav-item-active' : 'manage-user-nav-item')

    render() {
        let path = '/management';
        const searchPage = this.props.manageUsers.manageUsersCurrentPage;
        return (
            <>
                <div id="manage-user-nav" className="rev-background-color manage-user-nav">
                    <div id="manage-cohorts-view-selection-container">
                        <div>View By Role:</div>
                        <Dropdown color="success" className="responsive-modal-row-item rev-btn"
                            isOpen={this.state.roleDropdownList} toggle={this.toggleDropdownList}>
                            <DropdownToggle caret>
                                {this.props.manageUsers.option}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem >
                                    <Link to={path + "/manage/all"}
                                        className={`nav-link ${this.isActive('all')}`}
                                        onClick={() => this.updateDropdown('all', searchPage)}>All</Link></DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem>
                                    <Link to={path + "/manage/admin"}
                                        className={`nav-link ${this.isActive(cognitoRoles.ADMIN)}`}
                                        onClick={() => this.updateDropdown(cognitoRoles.ADMIN, searchPage)}>Admin</Link></DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem>
                                    <Link to={path + "/manage/trainer"}
                                        className={`nav-link ${this.isActive(cognitoRoles.TRAINER)}`}
                                        onClick={() => this.updateDropdown(cognitoRoles.TRAINER, searchPage)}>Trainer</Link></DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem>
                                    <Link to={path + "/manage/staging-manager"}
                                        className={`nav-link ${this.isActive(cognitoRoles.STAGING_MANAGER)}`}
                                        onClick={() => this.updateDropdown(cognitoRoles.STAGING_MANAGER, searchPage)}>Staging Manager</Link></DropdownItem>
                                <DropdownItem divider />
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    <div>
                        <Input
                            id="Search-user-by-partial-email-input"
                            className="responsive-modal-row-item no-backround-image"
                            placeholder="Email"
                            onChange={this.updateValueOfSearchEmail}
                            value={this.props.manageUsers.emailSearch}
                        />
                    </div>
                    <Button color="secondary" onClick={() => this.getUserByEmail(0)}>
                        Search
                    </Button>
                </div>



                <Table striped id="manage-users-table">
                    <ViewUserModal />
                    <thead className="rev-background-color">
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Roles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.manageUsers.manageUsers.map((user) =>
                                <tr key={user.email} className="rev-table-row" onClick={() => this.displayUserModal(user)}>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}</td>
                                </tr>
                            )
                        }
                    </tbody>
                </Table>
                <div className='row horizontal-centering vertical-centering'>
                    <Button variant="button-color" className="rev-background-color div-child" onClick={this.decrementPage}>Prev</Button>
                    <h6 className="div-child text-style" >
                        Page {this.props.manageUsers.manageUsersCurrentPage + 1} of {this.props.manageUsers.manageUsersPageTotal}
                    </h6>
                    <Button variant="button-color" className="rev-background-color div-child" onClick={this.incrementPage}>Next</Button>
                </div>
            </>
        )
    }
}