/**
 * A block that fetches and renders a job listing page
 * driven by recruitCRM
 */
import _ from 'lodash';
import actions from 'actions/recruitCRM';
import LoadingIndicator from 'components/LoadingIndicator';
import SearchCombo from 'components/GUIKit/SearchCombo';
import Paginate from 'components/GUIKit/Paginate';
import JobListCard from 'components/GUIKit/JobListCard';
import Dropdown from 'components/GUIKit/Dropdown';
import PT from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { getSalaryType, getCustomField } from 'utils/gigs';
import IconBlackLocation from 'assets/images/icon-black-location.svg';
import { config, Link } from 'topcoder-react-utils';
import { getQuery, updateQuery } from 'utils/url';
import { withOptimizely } from '@optimizely/react-sdk';
import './jobLisingStyles.scss';

const CONTENT_PREVIEW_LENGTH = 175;
const GIGS_PER_PAGE = 10;
// Sort by dropdown
const sortByOptions = [
  { label: 'Latest Added Descending', selected: true },
  { label: 'Latest Updated Descending', selected: false },
];
// Locations
let locations = [{
  label: 'All', selected: true,
}];

class RecruitCRMJobsContainer extends React.Component {
  constructor(props) {
    super(props);
    // Filter initial state
    this.state = {
      term: '',
      page: 0,
      sortBy: 'created_on',
      location: 'All',
    };
    // binds
    this.onSearch = this.onSearch.bind(this);
    this.onPaginate = this.onPaginate.bind(this);
    this.onFilter = this.onFilter.bind(this);
    this.onLocation = this.onLocation.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onHotlistApply = this.onHotlistApply.bind(this);
  }

  componentDidMount() {
    const {
      getJobs,
      jobs,
    } = this.props;
    const { state } = this;
    const q = getQuery();
    // This gets all jobs.
    // Pagination and filtering on front-side
    if (!jobs.length) {
      getJobs({
        job_status: 1, // Open jobs only
      });
    }
    // handle URL query if present
    if (q && q.search) {
      const stateUpdate = {
        ...state,
        term: q.search,
      };
      this.setState(stateUpdate);
    }
  }

  /**
   * Wraps all calls to setState
   * @param {Object} newState the state update
   */
  onFilter(newState) {
    // Do updates
    // update the state
    this.setState(newState);
  }

  onSearch(newTerm) {
    this.onFilter({
      term: newTerm,
      page: 0,
    });
    // update the URL query
    updateQuery({
      search: newTerm,
    });
  }

  onPaginate(newPage) {
    this.onFilter({
      page: newPage.selected,
    });
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  onLocation(newLocation) {
    const selected = _.find(newLocation, { selected: true });
    this.onFilter({
      location: selected.label,
      page: 0,
    });
  }

  onSort(newSort) {
    const selected = _.find(newSort, { selected: true });
    this.onFilter({
      sortBy: selected.label === 'Latest Updated Descending' ? 'updated_on' : 'created_on',
      page: 0,
    });
  }

  onHotlistApply() {
    const { optimizely } = this.props;
    optimizely.track('Hotlist ads click');
  }

  render() {
    const {
      loading,
      jobs,
      optimizely,
    } = this.props;
    const {
      term,
      page,
      sortBy,
      location,
    } = this.state;

    if (loading) {
      return (
        <React.Fragment>
          <LoadingIndicator />;
          <p styleName="loading-text">Searching our database for the best gigs…</p>
        </React.Fragment>
      );
    }

    // optimizely decide
    const decision = optimizely.decide('gig_listing_hotlist');
    let jobsToDisplay = jobs;
    // build hotlist of jobs if present
    let hotlistJobs = _.filter(jobs, (job) => {
      const showInHotlist = _.find(job.custom_fields, ['field_name', 'Show in Hotlist']);
      return showInHotlist && showInHotlist.value;
    });
    hotlistJobs = hotlistJobs.sort((a, b) => new Date(b.updated_on) - new Date(a.updated_on));
    hotlistJobs = _.slice(hotlistJobs, 0, 4);
    // build current locations dropdown based on all data
    // and filter by selected location
    jobsToDisplay = _.filter(jobs, (job) => {
      const country = job.country === 'Anywhere' || job.country === 'Any' ? 'All' : job.country;
      // build dropdown
      const found = _.findIndex(locations, { label: country });
      if (found === -1) {
        locations.push({
          label: country, selected: location.toLowerCase() === country.toLowerCase(),
        });
      } else {
        locations[found].selected = location.toLowerCase() === country.toLowerCase();
      }
      locations[0].selected = location === 'All';
      // filter
      if (location === 'Anywhere' || location === 'Any' || location === 'All') return true;
      return location.toLowerCase() === job.country.toLowerCase();
    });
    // sort location dropdown
    locations = _.sortBy(locations, ['label']);
    // Filter by term
    if (term) {
      jobsToDisplay = _.filter(jobsToDisplay, (job) => {
        // eslint-disable-next-line no-underscore-dangle
        const _term = term.toLowerCase();
        // name search
        if (job.name.toLowerCase().includes(_term)) return true;
        // skills search
        const skills = _.find(job.custom_fields, ['field_name', 'Technologies Required']);
        if (skills && skills.value && skills.value.toLowerCase().includes(_term)) return true;
        // location
        if (job.country.toLowerCase().includes(_term)) return true;
        // duration
        const duration = _.find(job.custom_fields, ['field_name', 'Duration']);
        if (duration && duration.value && duration.value.toLowerCase().includes(_term)) return true;
        // no match
        return false;
      });
    }
    // Sort controlled by sortBy state
    jobsToDisplay = jobsToDisplay.sort((a, b) => {
      // sort tags first no matter the sortBy
      const tagA = getCustomField(a.custom_fields, 'Job Tag');
      const tagB = getCustomField(b.custom_fields, 'Job Tag');
      if (tagB !== 'n/a' && tagA === 'n/a') return Number.MAX_VALUE;
      if (tagB === 'n/a' && tagA !== 'n/a') return -Number.MIN_VALUE;
      return new Date(b[sortBy]) - new Date(a[sortBy]);
    });
    // Calc pages
    const pages = Math.ceil(jobsToDisplay.length / GIGS_PER_PAGE);
    // Paginate the results
    jobsToDisplay = _.slice(
      jobsToDisplay,
      page * GIGS_PER_PAGE, (page * GIGS_PER_PAGE) + GIGS_PER_PAGE,
    );

    return (
      <div styleName={hotlistJobs.length && decision.enabled ? 'container-with-hotlist' : 'container'}>
        <div styleName="gigs">
          <div styleName="filters">
            <SearchCombo placeholder="Search Gig Listings by Name or Skills" onSearch={this.onSearch} term={term} />
            <Dropdown label="Location" onChange={this.onLocation} options={locations} size="xs" />
            <Dropdown label="Sort by" onChange={this.onSort} options={sortByOptions} size="xs" />
          </div>
          <div styleName="jobs-list-container">
            {
              jobsToDisplay.length
                ? jobsToDisplay.map(job => <JobListCard job={job} key={job.slug} />)
                : <span styleName="no-results">No Results</span>
            }
          </div>
          {
            jobsToDisplay.length
              ? <Paginate onChange={this.onPaginate} pages={pages} page={page} /> : null
          }
        </div>
        {
          hotlistJobs.length && decision.enabled && (
            <div styleName="hotlist">
              <h5>HOT THIS WEEK</h5>
              <div styleName="hotlist-items">
                {
                  hotlistJobs.map((hjob, indx) => (indx <= 1 ? (
                    <Link styleName={`hotlist-item-${indx + 1}`} to={`${config.GIGS_PAGES_PATH}/${hjob.slug}`} key={`hotlist-item-${indx + 1}`} onClick={this.onHotlistApply}>
                      <div styleName="location"><IconBlackLocation /> {hjob.country}</div>
                      <h5 styleName="job-title">{hjob.name}</h5>
                      <div styleName="job-money">${hjob.min_annual_salary} - ${hjob.max_annual_salary} / {getSalaryType(hjob.salary_type)}</div>
                    </Link>
                  ) : (
                    <div styleName={`hotlist-item-${indx + 1}`} to={`${config.GIGS_PAGES_PATH}/${hjob.slug}`} key={`hotlist-item-${indx + 1}`}>
                      <div styleName="location"><IconBlackLocation /> {hjob.country}</div>
                      <h5 styleName="job-title">{hjob.name}</h5>
                      <div styleName="job-money">${hjob.min_annual_salary} - ${hjob.max_annual_salary} / {getSalaryType(hjob.salary_type)}</div>
                      <div styleName="job-desc">
                        {
                          `${getCustomField(hjob.custom_fields, 'Hotlist excerpt') === 'n/a' ? '' : `${getCustomField(hjob.custom_fields, 'Hotlist excerpt').substring(0, CONTENT_PREVIEW_LENGTH)}...`}`
                        }
                      </div>
                      <Link styleName={`hotlist-item-button-${indx + 1}`} to={`${config.GIGS_PAGES_PATH}/${hjob.slug}`} onClick={this.onHotlistApply}>Apply Now</Link>
                    </div>
                  )))
                }
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

RecruitCRMJobsContainer.defaultProps = {
  jobs: [],
  loading: true,
};

RecruitCRMJobsContainer.propTypes = {
  getJobs: PT.func.isRequired,
  loading: PT.bool,
  jobs: PT.arrayOf(PT.shape),
  optimizely: PT.shape().isRequired,
};

function mapStateToProps(state) {
  const data = state.recruitCRM;
  return {
    jobs: data ? data.jobs : [],
    loading: data ? data.loading : true,
  };
}

function mapDispatchToActions(dispatch) {
  const a = actions.recruit;
  return {
    getJobs: (ownProps) => {
      dispatch(a.getJobsInit(ownProps));
      dispatch(a.getJobsDone(ownProps));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToActions,
)(withOptimizely(RecruitCRMJobsContainer));
