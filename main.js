import Wikiapi from 'wikiapi';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

/* Underlay & Wikipedia parameters */
/* ------------------------------- */
const ulCollection = 'reliable-sources/vaccine-topics-xmsdk95byp';
const ulCollectionVersion = '0.0.2';
const wikiPageDestination = 'Wikipedia:Vaccine safety/Sources/Assessments';
const ulCollectionUrl = `https://www.underlay.org/api/${ulCollection}/download?version=${ulCollectionVersion}`;
/* ------------------------------- */

/* Set edit summary */
const editsummary = `Updated from ${ulCollectionUrl}`

/* Load the Underlay collection data and parse it into Wikitable formatting */
const parseJson = async () => {
	/* Fetch UL collection data */
	const response = await fetch(ulCollectionUrl, { json: true });
	const body = await response.text();
	const data = JSON.parse(body);

	/* Iterate over each Source and format it into Wikitable formatting */
	const sources = data.data.Source;
	const tableText = sources.reduce((prev, curr) => {
		const split = curr.discussionForum.split('(');
		const forumPrefix = split[0];
		const forumSuffix = split[1];

		const discussionForumText =
			split.length > 1 ? `[${forumSuffix} ${forumPrefix.trim()}]` : forumPrefix;
		return `${prev}
|-
|${curr.type}
|${curr.name}
|${curr.assessment}		
|${discussionForumText}
|${curr.discussionLastDate}
|
|[${curr.url}]
|${curr.uses}
		`.trim();
	}, '');
	return tableText;
};

const run = async () => {
	/* Login to wikiAPI */
	const wiki = new Wikiapi();
	const login_options = {
		user_name: process.env.username,
		password: process.env.password,
	};
	await wiki.login(login_options);

	/* Set page that the table will be written to. */
	await wiki.page(wikiPageDestination);

	/* Load values in Wikitable text format from Underlay collection */
	const dataValues = await parseJson();

	/* Call wiki.edit function to write to the destination Wiki page */
	/* Note, this will overwrite the entire content of the page, if  */
	/* you want to append or edit, manipulate the `pageData` value.  */
	await wiki.edit(
		(_pageData) => {
			return `{| class="wikitable sortable"
|-
! rowspan=2 | Type
! rowspan=2 width=30% | Source name
! rowspan=2 width=2%  | Assess<br/>ment
!   colspan=3   | Discussions
! rowspan=2 | URL
! rowspan=2 | Uses
|-
!  Forums
!  width=2%  | Date (last)
!  width=30% | Discussion summary
${dataValues}
|}`;
		},
		{ bot: 1, summary: `${editsummary}` }
	);
};

run();
