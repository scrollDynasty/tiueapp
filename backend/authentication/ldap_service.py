import requests
import json
import logging
from django.conf import settings
from typing import Dict, Any, Optional, Tuple
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

class LDAPService:

    def __init__(self):

        self.base_url = getattr(settings, 'LDAP_BASE_URL', 'https://my.tiue.uz')

        self.endpoints = {
            'login': '/mobile/login',
            'refresh': '/mobile/refresh',
            'profile': '/mobile/data-student-profile',
            'courses': '/mobile/active-course-list',
            'grades': '/mobile/course-grades-list',
            'attendance': '/mobile/course-attendance-list',
            'messages': '/mobile/messages-list',
            'image': '/mobile/img',
            'search_students': '/mobile/students',
        }

        self.timeout = 30

    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None,
                     headers: Dict = None, params: Dict = None) -> Tuple[bool, Dict]:

        url = f"{self.base_url}{endpoint}"

        default_headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'TIUE-Mobile-Backend/1.0',
        }

        if headers:
            default_headers.update(headers)

        try:

            if logger.isEnabledFor(logging.DEBUG):
                logger.debug(f"LDAP API Request: {method} {url}")

            if method.upper() == 'GET':
                response = requests.get(
                    url,
                    headers=default_headers,
                    params=params,
                    timeout=self.timeout,
                    verify=False
                )
            elif method.upper() == 'POST':
                response = requests.post(
                    url,
                    headers=default_headers,
                    json=data,
                    params=params,
                    timeout=self.timeout,
                    verify=False
                )
            else:
                logger.error(f"Unsupported HTTP method: {method}")
                return False, {'error': 'Unsupported HTTP method'}

            if response.status_code == 200:
                try:
                    response_data = response.json()
                    return True, response_data
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to decode JSON response: {e}")
                    return False, {'error': 'Invalid JSON response from LDAP server'}
            else:
                try:
                    error_data = response.json()
                    logger.warning(f"LDAP API Error {response.status_code}: {error_data}")
                    return False, error_data
                except json.JSONDecodeError:
                    logger.error(f"LDAP API Error {response.status_code}: {response.text}")
                    return False, {'error': f'HTTP {response.status_code}', 'details': response.text}

        except requests.exceptions.Timeout:
            logger.error("LDAP API request timeout")
            return False, {'error': 'Request timeout'}
        except requests.exceptions.ConnectionError:
            logger.error("LDAP API connection error")
            return False, {'error': 'Connection error'}
        except requests.exceptions.RequestException as e:
            logger.error(f"LDAP API request error: {e}")
            return False, {'error': 'Request failed'}

    def login(self, username: str, password: str) -> Tuple[bool, Dict]:

        data = {
            'username': username,
            'password': password
        }

        success, response = self._make_request(
            self.endpoints['login'],
            method='POST',
            data=data
        )

        if success:
            logger.info(f"LDAP login successful for user: {username}")
        else:
            logger.warning(f"LDAP login failed for user: {username}")

        return success, response

    def refresh_token(self, refresh_token: str) -> Tuple[bool, Dict]:

        data = {
            'refresh_token': refresh_token
        }

        success, response = self._make_request(
            self.endpoints['refresh'],
            method='POST',
            data=data
        )

        if success:
            logger.info("LDAP token refresh successful")
        else:
            logger.warning("LDAP token refresh failed")

        return success, response

    def get_user_profile(self, access_token: str) -> Tuple[bool, Dict]:

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        success, response = self._make_request(
            self.endpoints['profile'],
            method='POST',
            headers=headers
        )

        if success and logger.isEnabledFor(logging.DEBUG):
            logger.debug(f"LDAP profile response keys: {response.keys() if isinstance(response, dict) else 'not a dict'}")

        return success, response

    def get_active_courses(self, access_token: str, lang: str = 'en',
                          page: int = 1, page_size: int = 100) -> Tuple[bool, Dict]:

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        params = {
            'lang': lang,
            'page': page,
            'pageSize': page_size,
            'skip': (page - 1) * page_size,
            'take': page_size,
        }

        success, response = self._make_request(
            self.endpoints['courses'],
            method='GET',
            headers=headers,
            params=params
        )

        return success, response

    def get_course_grades(self, access_token: str) -> Tuple[bool, Dict]:

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        success, response = self._make_request(
            self.endpoints['grades'],
            method='GET',
            headers=headers
        )

        return success, response

    def get_course_attendance(self, access_token: str) -> Tuple[bool, Dict]:

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        success, response = self._make_request(
            self.endpoints['attendance'],
            method='GET',
            headers=headers
        )

        return success, response

    def get_messages(self, access_token: str) -> Tuple[bool, Dict]:

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        logger.info("LDAP get messages")
        success, response = self._make_request(
            self.endpoints['messages'],
            method='POST',
            headers=headers
        )

        return success, response

    def upload_image(self, access_token: str, image_data) -> Tuple[bool, Dict]:

        headers = {
            'Authorization': f'Bearer {access_token}'

        }

        logger.info("LDAP upload image")

        url = f"{self.base_url}{self.endpoints['image']}"

        try:
            response = requests.post(
                url,
                headers=headers,
                files=image_data,
                timeout=self.timeout,
                verify=False
            )

            if response.status_code == 200:
                try:
                    response_data = response.json()
                    return True, response_data
                except json.JSONDecodeError:
                    return False, {'error': 'Invalid JSON response'}
            else:
                try:
                    error_data = response.json()
                    return False, error_data
                except json.JSONDecodeError:
                    return False, {'error': f'HTTP {response.status_code}'}

        except requests.exceptions.RequestException as e:
            logger.error(f"LDAP image upload error: {e}")
            return False, {'error': 'Upload failed'}

    def search_students(self, access_token: str, query: Optional[str] = None,
                       group: Optional[str] = None, limit: int = 50) -> Tuple[bool, Dict]:

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        params = {
            'page': 1,
            'pageSize': 100,
            'skip': 0,
            'take': 100
        }

        if query:
            filters = [
                {"field": "display_name", "operator": "contains", "value": query},
                {"field": "uid", "operator": "contains", "value": query},
                {"field": "mail", "operator": "contains", "value": query}
            ]
            params['filter'] = json.dumps({"logic": "or", "filters": filters})

        try:

            success, response = self._make_request(
                self.endpoints['search_students'],
                method='GET',
                headers=headers,
                params=params
            )

            if not success:
                return False, {'error': 'Failed to search students', 'students': []}

            if isinstance(response, list):
                students_data = response
            elif isinstance(response, dict):
                students_data = response.get('data', [])
            else:
                students_data = []

            formatted_students = []
            for student in students_data:

                if logger.isEnabledFor(logging.DEBUG):
                    logger.debug(f"LDAP student raw data: {student}")

                department = student.get('department', 'no info')

                if group and department != group:
                    continue

                display_name = student.get('display_name', '')
                name_parts = [p for p in display_name.strip().split() if p]

                if len(name_parts) >= 2:
                    first_name = name_parts[0].title()
                    last_name = ' '.join(name_parts[1:]).title()
                elif len(name_parts) == 1:
                    first_name = name_parts[0].title()
                    last_name = ''
                else:
                    first_name = ''
                    last_name = ''

                formatted_student = {
                    'id': student.get('uid', ''),
                    'username': student.get('uid', ''),
                    'email': student.get('mail', ''),
                    'first_name': first_name,
                    'last_name': last_name,
                    'full_name': display_name,
                    'student': {
                        'group': {
                            'name': department
                        },
                        'department': department,
                        'status': student.get('status', 'Students'),
                        'student_id': student.get('student_id', 0)
                    }
                }
                formatted_students.append(formatted_student)

            return True, {'students': formatted_students}

        except Exception as e:
            logger.error(f"LDAP student search error: {e}")
            return False, {'error': str(e), 'students': []}

    def _search_students_mock(self, query: Optional[str] = None,
                             group: Optional[str] = None, limit: int = 50) -> Tuple[bool, Dict]:

        try:
            mock_students = [
                {
                    'uid': 'u24215',
                    'email': 'u24215@tiue.uz',
                    'full_name': 'MATYOKUBOV UMAR RUSLANBEKOVICH',
                    'group': 'RC-24-01',
                    'jshr': '51403056520010',
                    'phone': '+998997924540',
                    'birthday': '14.03.2005',
                    'department': 'RC 24-01',
                    'yonalishCon': 'Biznes Boshqaruvi'
                },
                {
                    'uid': 'u24216',
                    'email': 'u24216@tiue.uz',
                    'full_name': 'KARIMOVA MADINA AKMALOVNA',
                    'group': 'IT-23-02',
                    'jshr': '51403056520011',
                    'department': 'IT 23-02',
                    'yonalishCon': 'Axborot Texnologiyalari'
                },
                {
                    'uid': 'u24217',
                    'email': 'u24217@tiue.uz',
                    'full_name': 'RAKHIMOV JAVOHIR SHUKUROVICH',
                    'group': 'CS-22-01',
                    'jshr': '51403056520012',
                    'department': 'CS 22-01',
                    'yonalishCon': 'Computer Science'
                },
                {
                    'uid': 'u24218',
                    'email': 'u24218@tiue.uz',
                    'full_name': 'NAZAROVA DILFUZA BAKHTIYOROVNA',
                    'group': 'RC-24-01',
                    'jshr': '51403056520013',
                    'department': 'RC 24-01',
                    'yonalishCon': 'Biznes Boshqaruvi'
                },
                {
                    'uid': 'u24219',
                    'email': 'u24219@tiue.uz',
                    'full_name': 'TOSHMATOV BEKZOD ULUGBEKOVICH',
                    'group': 'IT-23-01',
                    'jshr': '51403056520014',
                    'department': 'IT 23-01',
                    'yonalishCon': 'Axborot Texnologiyalari'
                }
            ]

            filtered_students = mock_students

            if query:
                query_lower = query.lower()
                filtered_students = [
                    s for s in filtered_students
                    if query_lower in s['uid'].lower() or
                       query_lower in s['full_name'].lower() or
                       query_lower in s['email'].lower()
                ]

            if group:
                filtered_students = [
                    s for s in filtered_students
                    if s.get('department', '') == group or s.get('group', '') == group
                ]

            filtered_students = filtered_students[:limit]

            formatted_students = []
            for student in filtered_students:
                formatted_students.append({
                    'id': student['uid'],
                    'username': student['uid'],
                    'email': student['email'],
                    'first_name': self._extract_first_name(student['full_name']),
                    'last_name': self._extract_last_name(student['full_name']),
                    'full_name': student['full_name'],
                    'student': {
                        'group': {
                            'name': student.get('group', ''),
                            'course': self._extract_course_from_group(student.get('group', ''))
                        },
                        'course': self._extract_course_from_group(student.get('group', '')),
                        'department': student.get('department', ''),
                        'yonalish': student.get('yonalishCon', '')
                    }
                })

            return True, {'students': formatted_students}

        except Exception as e:
            logger.error(f"Mock student search error: {e}")
            return False, {'error': str(e), 'students': []}

    def _extract_first_name(self, full_name: str) -> str:

        if not full_name:
            return ''

        parts = [p for p in full_name.strip().split(' ') if p]

        if len(parts) > 1:
            return parts[1].title()

        return parts[0].title() if parts else ''

    def _extract_last_name(self, full_name: str) -> str:

        if not full_name:
            return ''

        parts = [p for p in full_name.strip().split(' ') if p]

        return parts[0].title() if parts else ''

    def _extract_course_from_group(self, group_name: str) -> int:

        if not group_name:
            return 1
        import re

        match = re.search(r'-(\d{2})-', group_name)
        if match:
            year = int(match.group(1))
            current_year = 25
            return max(1, current_year - year + 1)
        return 1

ldap_service = LDAPService()
