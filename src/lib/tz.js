/**
 * Timezone utilities and calculations for SAM Time Formatter
 */

// Popular global business hubs and cities for quick selection
export const POPULAR_TIMEZONES = [
	{ id: 'UTC', label: 'UTC — Coordinated Universal Time', city: 'UTC', country: 'Universal', alias: 'GMT UTC' },
	{ id: 'America/New_York', label: 'New York (ET) — United States', city: 'New York', country: 'United States', alias: 'EST EDT NY NYC' },
	{ id: 'America/Los_Angeles', label: 'Los Angeles (PT) — United States', city: 'Los Angeles', country: 'United States', alias: 'PST PDT LA SF San Francisco' },
	{ id: 'America/Chicago', label: 'Chicago (CT) — United States', city: 'Chicago', country: 'United States', alias: 'CST CDT Central' },
	{ id: 'America/Denver', label: 'Denver (MT) — United States', city: 'Denver', country: 'United States', alias: 'MST MDT Mountain' },
	{ id: 'America/Toronto', label: 'Toronto (ET) — Canada', city: 'Toronto', country: 'Canada', alias: 'Toronto Canada' },
	{ id: 'America/Vancouver', label: 'Vancouver (PT) — Canada', city: 'Vancouver', country: 'Canada', alias: 'Vancouver' },
	{ id: 'America/Sao_Paulo', label: 'São Paulo — Brazil', city: 'São Paulo', country: 'Brazil', alias: 'BRT Brazil Sao Paulo' },
	{ id: 'Europe/London', label: 'London (GMT/BST) — United Kingdom', city: 'London', country: 'United Kingdom', alias: 'GMT BST UK Britain' },
	{ id: 'Europe/Paris', label: 'Paris (CET/CEST) — France', city: 'Paris', country: 'France', alias: 'CET CEST France' },
	{ id: 'Europe/Berlin', label: 'Berlin (CET/CEST) — Germany', city: 'Berlin', country: 'Germany', alias: 'Germany CET CEST' },
	{ id: 'Europe/Amsterdam', label: 'Amsterdam — Netherlands', city: 'Amsterdam', country: 'Netherlands', alias: 'CET CEST Holland' },
	{ id: 'Europe/Zurich', label: 'Zurich — Switzerland', city: 'Zurich', country: 'Switzerland', alias: 'Switzerland CET' },
	{ id: 'Europe/Madrid', label: 'Madrid — Spain', city: 'Madrid', country: 'Spain', alias: 'Spain CET CEST' },
	{ id: 'Europe/Rome', label: 'Rome — Italy', city: 'Rome', country: 'Italy', alias: 'Italy Rome' },
	{ id: 'Asia/Dubai', label: 'Dubai (GST) — UAE', city: 'Dubai', country: 'United Arab Emirates', alias: 'GST UAE Gulf Abu Dhabi' },
	{ id: 'Asia/Kolkata', label: 'India Standard Time (IST) — New Delhi / Mumbai', city: 'Kolkata / Mumbai / Delhi', country: 'India', alias: 'IST India Mumbai Delhi Bangalore Chennai Hyderabad' },
	{ id: 'Asia/Singapore', label: 'Singapore (SGT)', city: 'Singapore', country: 'Singapore', alias: 'SGT Singapore' },
	{ id: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', city: 'Hong Kong', country: 'Hong Kong', alias: 'HKT HK' },
	{ id: 'Asia/Tokyo', label: 'Tokyo (JST) — Japan', city: 'Tokyo', country: 'Japan', alias: 'JST Japan Tokyo' },
	{ id: 'Asia/Seoul', label: 'Seoul (KST) — South Korea', city: 'Seoul', country: 'South Korea', alias: 'KST Korea Seoul' },
	{ id: 'Asia/Shanghai', label: 'Beijing / Shanghai (CST) — China', city: 'Shanghai / Beijing', country: 'China', alias: 'CST China Beijing' },
	{ id: 'Asia/Bangkok', label: 'Bangkok (ICT) — Thailand', city: 'Bangkok', country: 'Thailand', alias: 'ICT Thailand' },
	{ id: 'Australia/Sydney', label: 'Sydney (AEST/AEDT) — Australia', city: 'Sydney', country: 'Australia', alias: 'AEST AEDT Sydney Australia' },
	{ id: 'Australia/Melbourne', label: 'Melbourne — Australia', city: 'Melbourne', country: 'Australia', alias: 'Melbourne Australia' },
	{ id: 'Australia/Perth', label: 'Perth (AWST) — Australia', city: 'Perth', country: 'Australia', alias: 'AWST Perth Western Australia' },
	{ id: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT) — New Zealand', city: 'Auckland', country: 'New Zealand', alias: 'NZST NZDT New Zealand Wellington' },
	{ id: 'Pacific/Honolulu', label: 'Honolulu (HST) — Hawaii', city: 'Honolulu', country: 'United States', alias: 'HST Hawaii Honolulu' }
];

/**
 * Get the user's detected local timezone.
 */
export function getUserTimezone() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	} catch {
		return 'UTC';
	}
}

/**
 * Returns a list of all supported IANA timezones with formatting.
 */
export function getAllTimezones() {
	let supported = [];
	try {
		if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
			supported = Intl.supportedValuesOf('timeZone');
		}
	} catch {
		// Fallback
	}

	if (!supported || supported.length === 0) {
		supported = POPULAR_TIMEZONES.map((p) => p.id);
	}

	const popularMap = new Map(POPULAR_TIMEZONES.map((p) => [p.id, p]));
	const now = new Date();

	return supported.map((tz) => {
		const popular = popularMap.get(tz);
		const offset = getTimezoneOffsetString(now, tz);
		const city = tz.split('/').pop().replace(/_/g, ' ');
		const region = tz.split('/')[0];
		
		let label = popular ? popular.label : `${city} (${offset}) — ${tz}`;
		let searchTerms = `${tz} ${city} ${region} ${offset} ${popular ? popular.alias : ''}`.toLowerCase();

		return {
			id: tz,
			label,
			city,
			region,
			offset,
			isPopular: !!popular,
			searchTerms
		};
	});
}

/**
 * Computes offset in minutes between UTC and the specified timezone for a given date.
 */
export function getTimezoneOffsetMinutes(date, timeZone) {
	try {
		const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
		const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
		return Math.round((tzDate.getTime() - utcDate.getTime()) / 60000);
	} catch {
		return 0;
	}
}

/**
 * Returns a formatted offset string like "UTC+05:30" or "UTC-05:00".
 */
export function getTimezoneOffsetString(date, timeZone) {
	const mins = getTimezoneOffsetMinutes(date, timeZone);
	const sign = mins >= 0 ? '+' : '-';
	const abs = Math.abs(mins);
	const h = String(Math.floor(abs / 60)).padStart(2, '0');
	const m = String(abs % 60).padStart(2, '0');
	return `UTC${sign}${h}:${m}`;
}

/**
 * Returns short timezone abbreviation if available (e.g. "EST", "IST", "GMT").
 */
export function getTimezoneAbbr(date, timeZone) {
	try {
		const parts = new Intl.DateTimeFormat('en-US', {
			timeZone,
			timeZoneName: 'short'
		}).formatToParts(date);
		const p = parts.find((part) => part.type === 'timeZoneName');
		return p ? p.value : '';
	} catch {
		return '';
	}
}

/**
 * Determines whether Daylight Saving Time is active at the given date in the specified timezone.
 */
export function isDST(date, timeZone) {
	try {
		const year = date.getFullYear();
		const janOffset = getTimezoneOffsetMinutes(new Date(year, 0, 1), timeZone);
		const julOffset = getTimezoneOffsetMinutes(new Date(year, 6, 1), timeZone);
		const minOffset = Math.min(janOffset, julOffset);
		const maxOffset = Math.max(janOffset, julOffset);
		if (minOffset === maxOffset) return false;
		const currentOffset = getTimezoneOffsetMinutes(date, timeZone);
		return currentOffset === maxOffset;
	} catch {
		return false;
	}
}

/**
 * Parses a local date/time string (e.g. "2026-11-02T16:30" or "2026-11-02 16:30:00")
 * in the context of the specified timezone, returning the exact UTC Date.
 */
export function parseInTimezone(dtStr, timeZone) {
	if (!dtStr) return null;
	const match = String(dtStr).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
	if (!match) return null;

	const year = parseInt(match[1], 10);
	const month = parseInt(match[2], 10);
	const day = parseInt(match[3], 10);
	const hour = match[4] ? parseInt(match[4], 10) : 0;
	const minute = match[5] ? parseInt(match[5], 10) : 0;
	const second = match[6] ? parseInt(match[6], 10) : 0;

	let guess = Date.UTC(year, month - 1, day, hour, minute, second);

	try {
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hour12: false
		});

		function getParts(ms) {
			const parts = formatter.formatToParts(new Date(ms));
			const map = {};
			for (const p of parts) {
				if (p.type !== 'literal') map[p.type] = parseInt(p.value, 10);
			}
			if (map.hour === 24) map.hour = 0;
			return Date.UTC(map.year, map.month - 1, map.day, map.hour, map.minute, map.second);
		}

		for (let i = 0; i < 3; i++) {
			const formatted = getParts(guess);
			const diff = formatted - Date.UTC(year, month - 1, day, hour, minute, second);
			if (diff === 0) break;
			guess -= diff;
		}

		const result = new Date(guess);
		if (isNaN(result.getTime())) return null;
		return result;
	} catch {
		return null;
	}
}

/**
 * Formats a Date object in the target timezone with rich metadata.
 */
export function formatInTimezone(date, timeZone) {
	if (!date || isNaN(date.getTime())) return null;

	try {
		const formatterParts = new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		}).formatToParts(date);

		const map = {};
		for (const p of formatterParts) {
			if (p.type !== 'literal') map[p.type] = p.value;
		}
		if (map.hour === '24') map.hour = '00';

		const hourNum = parseInt(map.hour, 10);
		const minuteNum = parseInt(map.minute, 10);

		// Format readable date and time
		const longFmt = new Intl.DateTimeFormat('en-US', {
			timeZone,
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});

		const time12Fmt = new Intl.DateTimeFormat('en-US', {
			timeZone,
			hour: 'numeric',
			minute: '2-digit',
			second: '2-digit',
			hour12: true
		});

		const offsetStr = getTimezoneOffsetString(date, timeZone);
		const rawOffset = offsetStr.replace('UTC', '');
		const abbr = getTimezoneAbbr(date, timeZone);
		const dst = isDST(date, timeZone);

		const dateOnly = `${map.year}-${map.month}-${map.day}`;
		const time24 = `${map.hour}:${map.minute}:${map.second}`;
		const time12 = time12Fmt.format(date);
		const datetimeLocal = `${dateOnly}T${time24}`;
		const iso = `${dateOnly}T${time24}${rawOffset}`;
		const formattedLong = `${longFmt.format(date)} · ${time12} ${abbr ? `(${abbr})` : ''}`.trim();

		return {
			dateOnly,
			time24,
			time12,
			datetimeLocal,
			iso,
			offsetStr,
			offsetMinutes: getTimezoneOffsetMinutes(date, timeZone),
			abbr,
			isDST: dst,
			dstLabel: dst ? 'Daylight Saving Time (DST)' : 'Standard Time',
			formattedLong,
			weekday: longFmt.formatToParts(date).find((p) => p.type === 'weekday')?.value || '',
			hours: hourNum,
			minutes: minuteNum
		};
	} catch (e) {
		console.error('formatInTimezone error', e);
		return null;
	}
}

/**
 * Calculates time difference between source and target timezone at the specified date.
 */
export function calculateTimeDifference(date, sourceTz, targetTz) {
	const sourceOffset = getTimezoneOffsetMinutes(date, sourceTz);
	const targetOffset = getTimezoneOffsetMinutes(date, targetTz);
	const diffMinutes = targetOffset - sourceOffset;
	const absMins = Math.abs(diffMinutes);
	const h = Math.floor(absMins / 60);
	const m = absMins % 60;

	let diffText = '';
	if (diffMinutes === 0) {
		diffText = 'Same time as source';
	} else {
		const direction = diffMinutes > 0 ? 'ahead of' : 'behind';
		const parts = [];
		if (h > 0) parts.push(`${h} hr${h > 1 ? 's' : ''}`);
		if (m > 0) parts.push(`${m} min${m > 1 ? 's' : ''}`);
		diffText = `${parts.join(' ')} ${direction} source`;
	}

	// Calculate calendar day shift
	const srcData = formatInTimezone(date, sourceTz);
	const tgtData = formatInTimezone(date, targetTz);
	let dayShift = 0;
	let dayShiftLabel = 'Same day';

	if (srcData && tgtData) {
		if (tgtData.dateOnly > srcData.dateOnly) {
			dayShift = 1;
			dayShiftLabel = '+1 day (Tomorrow)';
		} else if (tgtData.dateOnly < srcData.dateOnly) {
			dayShift = -1;
			dayShiftLabel = '-1 day (Yesterday)';
		}
	}

	return {
		diffMinutes,
		diffHours: (diffMinutes / 60).toFixed(1).replace(/\.0$/, ''),
		diffText,
		dayShift,
		dayShiftLabel
	};
}

/**
 * Returns work / awake / night status for an hour (0-23).
 */
export function getWorkingStatus(hour) {
	if (hour >= 9 && hour < 17) {
		return { status: 'work', label: 'Office Hours (9 AM - 5 PM)', badge: 'Work Hours', color: 'green' };
	}
	if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 22)) {
		return { status: 'shoulder', label: 'Awake / Evening Hours', badge: 'Awake', color: 'amber' };
	}
	return { status: 'sleep', label: 'Sleeping / Night Hours', badge: 'Night', color: 'purple' };
}

