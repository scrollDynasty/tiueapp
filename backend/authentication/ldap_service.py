import requests
import json
import logging
from django.conf import settings
from typing import Dict, Any, Optional, Tuple
import urllib3

# Отключаем предупреждения о SSL сертификатах
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

class LDAPService:
    """
    Сервис для работы с LDAP API
    Проксирует запросы к внешнему LDAP серверу
    """
    
    def __init__(self):
        # Базовый URL LDAP API
        self.base_url = getattr(settings, 'LDAP_BASE_URL', 'https://my.tiue.uz')
        
        # Endpoints
        self.endpoints = {
            'login': '/mobile/login',
            'refresh': '/mobile/refresh',
            'profile': '/mobile/data-student-profile',
            'courses': '/mobile/active-course-list',
            'grades': '/mobile/course-grades-list',
            'attendance': '/mobile/course-attendance-list',
            'messages': '/mobile/messages-list',
            'image': '/mobile/img',
            'search_students': '/mobile/students',  # Реальный LDAP endpoint для поиска студентов
        }
        
        # Таймаут для запросов
        self.timeout = 30

    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, 
                     headers: Dict = None, params: Dict = None) -> Tuple[bool, Dict]:
        """
        Выполняет запрос к LDAP API
        
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        url = f"{self.base_url}{endpoint}"
        
        # Базовые заголовки
        default_headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'TIUE-Mobile-Backend/1.0',
        }
        
        if headers:
            default_headers.update(headers)
        
        try:
            # Логирование только в режиме отладки
            if logger.isEnabledFor(logging.DEBUG):
                logger.debug(f"LDAP API Request: {method} {url}")
            
            if method.upper() == 'GET':
                response = requests.get(
                    url, 
                    headers=default_headers, 
                    params=params, 
                    timeout=self.timeout,
                    verify=False  # Отключаем проверку SSL сертификата
                )
            elif method.upper() == 'POST':
                response = requests.post(
                    url, 
                    headers=default_headers, 
                    json=data, 
                    params=params, 
                    timeout=self.timeout,
                    verify=False  # Отключаем проверку SSL сертификата
                )
            else:
                logger.error(f"Unsupported HTTP method: {method}")
                return False, {'error': 'Unsupported HTTP method'}
            
            # Проверяем статус ответа
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
        """
        Авторизация в LDAP
        
        Args:
            username: Имя пользователя (например, U22312)
            password: Пароль
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
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
        """
        Обновление access токена
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
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
        """
        Получение профиля пользователя
        
        Args:
            access_token: Access token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        success, response = self._make_request(
            self.endpoints['profile'], 
            method='POST',  # Согласно документации это POST
            headers=headers
        )
        
        # Логируем поля профиля для отладки аватарок
        if success and logger.isEnabledFor(logging.DEBUG):
            logger.debug(f"LDAP profile response keys: {response.keys() if isinstance(response, dict) else 'not a dict'}")
        
        return success, response

    def get_active_courses(self, access_token: str, lang: str = 'en', 
                          page: int = 1, page_size: int = 100) -> Tuple[bool, Dict]:
        """
        Получение активных курсов
        
        Args:
            access_token: Access token
            lang: Язык (en/ru)
            page: Номер страницы
            page_size: Размер страницы (увеличено до 100 для получения всех курсов)
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
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
        """
        Получение оценок по курсам
        
        Args:
            access_token: Access token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
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
        """
        Получение данных о посещаемости
        
        Args:
            access_token: Access token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
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
        """
        Получение сообщений
        
        Args:
            access_token: Access token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        logger.info("LDAP get messages")
        success, response = self._make_request(
            self.endpoints['messages'], 
            method='POST',  # Согласно документации это POST
            headers=headers
        )
        
        return success, response

    def upload_image(self, access_token: str, image_data) -> Tuple[bool, Dict]:
        """
        Загрузка изображения
        
        Args:
            access_token: Access token
            image_data: Данные изображения
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
            # Content-Type будет установлен автоматически для multipart
        }
        
        logger.info("LDAP upload image")
        
        # Для загрузки файлов используем отдельный метод
        url = f"{self.base_url}{self.endpoints['image']}"
        
        try:
            response = requests.post(
                url,
                headers=headers,
                files=image_data,  # Для multipart/form-data
                timeout=self.timeout,
                verify=False  # Отключаем проверку SSL сертификата
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
        """
        Поиск студентов через LDAP API
        
        Args:
            access_token: Access token для авторизации
            query: поисковый запрос (имя, фамилия, username)
            group: группа/department (например, BM_01 EN Year1)
            limit: максимальное количество результатов
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
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
            
            # Обрабатываем ответ от LDAP
            if isinstance(response, list):
                students_data = response
            elif isinstance(response, dict):
                students_data = response.get('data', [])
            else:
                students_data = []
            
            # Преобразуем формат данных для фронтенда с фильтрацией по группе
            formatted_students = []
            for student in students_data:
                # Логируем сырые данные от LDAP для отладки
                if logger.isEnabledFor(logging.DEBUG):
                    logger.debug(f"LDAP student raw data: {student}")
                
                department = student.get('department', 'no info')
                
                # Фильтруем по группе/department (если указан)
                if group and department != group:
                    continue
                
                # Обрабатываем имя
                display_name = student.get('display_name', '')
                name_parts = [p for p in display_name.strip().split() if p]
                
                # В LDAP формат: "ИМЯ ФАМИЛИЯ" (например, "SABINA SULAYMONOVA")
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
        """
        Mock реализация поиска студентов (fallback если LDAP не работает)
        """
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
            
            # Применяем фильтры к mock данным
            filtered_students = mock_students
            
            if query:
                query_lower = query.lower()
                filtered_students = [
                    s for s in filtered_students
                    if query_lower in s['uid'].lower() or 
                       query_lower in s['full_name'].lower() or 
                       query_lower in s['email'].lower()
                ]
            
            # Применяем фильтр по группе/department
            if group:
                filtered_students = [
                    s for s in filtered_students 
                    if s.get('department', '') == group or s.get('group', '') == group
                ]
            
            # Ограничиваем количество результатов
            filtered_students = filtered_students[:limit]
            
            # Преобразуем формат данных
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
        """
        Извлекает имя из полного имени
        Форматы: 
        - 'ФАМИЛИЯ ИМЯ ОТЧЕСТВО' -> 'Имя'
        - 'Иванов Иван Иванович' -> 'Иван'
        - 'USER  1 USER' -> 'User'
        """
        if not full_name:
            return ''
        # Убираем лишние пробелы и разбиваем
        parts = [p for p in full_name.strip().split(' ') if p]
        
        # Если есть хотя бы 2 слова, второе - имя
        if len(parts) > 1:
            return parts[1].title()
        # Если только одно слово, возвращаем его
        return parts[0].title() if parts else ''

    def _extract_last_name(self, full_name: str) -> str:
        """
        Извлекает фамилию из полного имени
        Форматы:
        - 'ФАМИЛИЯ ИМЯ ОТЧЕСТВО' -> 'Фамилия'
        - 'Иванов Иван Иванович' -> 'Иванов'
        - 'USER  1 USER' -> 'User'
        """
        if not full_name:
            return ''
        # Убираем лишние пробелы и разбиваем
        parts = [p for p in full_name.strip().split(' ') if p]
        # Первое слово всегда фамилия
        return parts[0].title() if parts else ''

    def _extract_course_from_group(self, group_name: str) -> int:
        """Извлекает курс из названия группы в формате 'RC-24-01'"""
        if not group_name:
            return 1
        import re
        # Ищем год в формате XX-XX (например, RC-24-01)
        match = re.search(r'-(\d{2})-', group_name)
        if match:
            year = int(match.group(1))
            current_year = 25  # 2025
            return max(1, current_year - year + 1)
        return 1


# Singleton instance
ldap_service = LDAPService()
