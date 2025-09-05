from rest_framework import serializers
from .models import CustomUser, Student, Professor, Admin

class CustomUserSerializer(serializers.ModelSerializer):
    faculty = serializers.SerializerMethodField()
    course = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar', 'is_active', 'created_at', 'updated_at', 'faculty', 'course', 'group', 'department', 'password']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def get_faculty(self, obj):
        if obj.role == 'student' and hasattr(obj, 'student_profile'):
            return obj.student_profile.faculty
        return None
    
    def get_course(self, obj):
        if obj.role == 'student' and hasattr(obj, 'student_profile'):
            return obj.student_profile.course
        return None
    
    def get_group(self, obj):
        if obj.role == 'student' and hasattr(obj, 'student_profile'):
            return obj.student_profile.group.name if obj.student_profile.group else None
        return None
    
    def get_department(self, obj):
        if obj.role == 'professor' and hasattr(obj, 'professor_profile'):
            return obj.professor_profile.department
        return None

class StudentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = Student
        fields = ['user', 'student_id', 'faculty', 'course', 'group', 'group_name', 'gpa']

class ProfessorSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = Professor
        fields = ['user', 'employee_id', 'department', 'title', 'subjects']

class AdminSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = Admin
        fields = ['user', 'permissions']

class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)
    
    # Поля для студентов
    student_id = serializers.CharField(max_length=20, required=False)
    faculty = serializers.CharField(max_length=100, required=False)
    course = serializers.IntegerField(required=False)
    group_id = serializers.IntegerField(required=False)
    
    # Поля для преподавателей
    employee_id = serializers.CharField(max_length=20, required=False)
    department = serializers.CharField(max_length=100, required=False)
    title = serializers.CharField(max_length=100, required=False)
    subjects = serializers.ListField(child=serializers.CharField(), required=False)
    
    def validate(self, data):
        role = data.get('role')
        
        if role == 'student':
            required_fields = ['student_id', 'faculty', 'course', 'group_id']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError(f"Поле {field} обязательно для студентов")
        
        elif role == 'professor':
            required_fields = ['employee_id', 'department']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError(f"Поле {field} обязательно для преподавателей")
        
        return data
